import { useState, useEffect, useCallback, useRef } from "react";
import {
  getMessages,
  type GetMessagesParams,
} from "../../../api/UserMessageController";
import type { UserMessage } from "../../../models/UserMessageModel";
import type { PagedResult } from "../../../models/PagedResult";
import UserMessageCreateButton from "../../atom/UserMessageCreateButton";
import UserMessageCreateModal from "../../atom/UserMessageCreateModal";

function UserMessageGrid() {
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");

  const [sortBy, setSortBy] = useState<
    "Id" | "MessageContent" | "SubmittedOn" | "ModifiedOn"
  >("SubmittedOn");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const totalPages = Math.ceil(totalCount / pageSize);

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (searchTerm.length >= 3 || searchTerm.length === 0) {
      debounceTimeoutRef.current = setTimeout(() => {
        setDebouncedSearchTerm(searchTerm);
        setCurrentPage(1);
      }, 1000);
    } else {
      setDebouncedSearchTerm("");
    }

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  const fetchMessages = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const params: GetMessagesParams = {
        pageNumber: currentPage,
        pageSize,
        sortBy,
        sortOrder,
        messageFilter: debouncedSearchTerm || undefined,
      };

      const result: PagedResult<UserMessage> = await getMessages(params);
      setMessages(result.items);
      setTotalCount(result.totalCount);
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        setError(err.message || "Failed to fetch messages");
        setMessages([]);
        setTotalCount(0);
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [currentPage, pageSize, sortBy, sortOrder, debouncedSearchTerm]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSortChange = (
    field: "Id" | "MessageContent" | "SubmittedOn" | "ModifiedOn"
  ) => {
    if (field === sortBy) {
      setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(field);
      setSortOrder("DESC");
    }
    setCurrentPage(1);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
  };

  const getSortIcon = (
    field: "Id" | "MessageContent" | "SubmittedOn" | "ModifiedOn"
  ) => {
    if (sortBy !== field) return "↕️";
    return sortOrder === "ASC" ? "↑" : "↓";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const truncateMessage = (message: string, maxLength: number = 40) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + "...";
  };

  const getSearchStatus = () => {
    if (searchTerm.length > 0 && searchTerm.length < 3) {
      return `Type ${3 - searchTerm.length} more character${
        3 - searchTerm.length > 1 ? "s" : ""
      } to search`;
    }
    if (searchTerm.length >= 3 && searchTerm !== debouncedSearchTerm) {
      return "Searching...";
    }
    if (debouncedSearchTerm) {
      return `Filtering by: "${debouncedSearchTerm}"`;
    }
    return "";
  };

  const handleCreateMessage = (data: {
    senderNumber: string;
    recipientNumber: string;
    messageContent: string;
  }) => {
    console.log("Creating message:", data);
    fetchMessages();
  };

  if (error) {
    return (
      <div className="UserMessageGrid">
        <div style={{ color: "red", padding: "1rem" }}>
          Error: {error}
          <button onClick={fetchMessages} style={{ marginLeft: "1rem" }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="UserMessageGrid">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <h3 style={{ margin: 0 }}>User Messages</h3>
        <UserMessageCreateButton onClick={() => setIsModalOpen(true)} />
      </div>

      <div
        style={{
          marginBottom: "1rem",
          display: "flex",
          gap: "1rem",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <label htmlFor="search-input" style={{ fontWeight: "600" }}>
            Search Messages:
          </label>
          <input
            id="search-input"
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search message content (min 3 characters)..."
            style={{
              padding: "0.5rem",
              minWidth: "300px",
              border:
                searchTerm.length > 0 && searchTerm.length < 3
                  ? "2px solid orange"
                  : "1px solid #ccc",
            }}
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              style={{
                padding: "0.5rem",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {getSearchStatus() && (
          <div
            style={{
              fontSize: "0.9em",
              color:
                searchTerm.length > 0 && searchTerm.length < 3
                  ? "orange"
                  : "#666",
              fontStyle: "italic",
            }}
          >
            {getSearchStatus()}
          </div>
        )}
      </div>

      {loading && <div>Loading messages...</div>}

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            tableLayout: "fixed",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  width: "80px",
                  cursor: "pointer",
                  userSelect: "none",
                }}
                onClick={() => handleSortChange("Id")}
                title="Click to sort by ID"
              >
                ID {getSortIcon("Id")}
              </th>
              <th style={{ width: "120px" }}>From</th>
              <th style={{ width: "120px" }}>To</th>
              <th
                style={{
                  width: "200px",
                  cursor: "pointer",
                  userSelect: "none",
                }}
                onClick={() => handleSortChange("MessageContent")}
                title="Click to sort by message content"
              >
                Message {getSortIcon("MessageContent")}
              </th>
              <th style={{ width: "100px" }}>Status</th>
              <th
                style={{
                  width: "180px",
                  cursor: "pointer",
                  userSelect: "none",
                }}
                onClick={() => handleSortChange("SubmittedOn")}
                title="Click to sort by submitted date"
              >
                Sent At {getSortIcon("SubmittedOn")}
              </th>
              <th
                style={{
                  width: "180px",
                  cursor: "pointer",
                  userSelect: "none",
                }}
                onClick={() => handleSortChange("ModifiedOn")}
                title="Click to sort by modified date"
              >
                Modified At {getSortIcon("ModifiedOn")}
              </th>
            </tr>
          </thead>
          <tbody>
            {messages.length === 0 && !loading ? (
              <tr>
                <td
                  colSpan={7}
                  style={{ textAlign: "center", padding: "1rem" }}
                >
                  {debouncedSearchTerm
                    ? "No messages found matching your search"
                    : "No messages found"}
                </td>
              </tr>
            ) : (
              messages.map((message) => (
                <tr key={message.id}>
                  <td
                    style={{
                      padding: "0.5rem",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {message.id}
                  </td>
                  <td
                    style={{
                      padding: "0.5rem",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {message.senderNumber}
                  </td>
                  <td
                    style={{
                      padding: "0.5rem",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {message.recipientNumber}
                  </td>
                  <td
                    style={{
                      padding: "0.5rem",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      cursor:
                        message.messageContent.length > 40 ? "help" : "default",
                    }}
                    title={
                      message.messageContent.length > 40
                        ? message.messageContent
                        : undefined
                    }
                  >
                    {truncateMessage(message.messageContent)}
                  </td>
                  <td
                    style={{
                      padding: "0.5rem",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {message.status}
                  </td>
                  <td
                    style={{
                      padding: "0.5rem",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatDate(message.submittedOn)}
                  </td>
                  <td
                    style={{
                      padding: "0.5rem",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatDate(message.modifiedOn)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div
        style={{
          marginTop: "1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          Showing {messages.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}{" "}
          to {Math.min(currentPage * pageSize, totalCount)} of {totalCount}{" "}
          messages
          {(sortBy || debouncedSearchTerm) && (
            <span
              style={{ marginLeft: "1rem", fontSize: "0.9em", color: "#666" }}
            >
              {sortBy && `(Sorted by ${sortBy} ${sortOrder})`}
              {sortBy && debouncedSearchTerm && ", "}
              {debouncedSearchTerm && `(Filtered by "${debouncedSearchTerm}")`}
            </span>
          )}
        </div>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <div>
            <label htmlFor="pageSize" style={{ marginRight: "0.5rem" }}>
              Items per page:
            </label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
          >
            First
          </button>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>

          <span style={{ padding: "0.5rem" }}>
            Page {currentPage} of {totalPages || 1}
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            Last
          </button>
        </div>
      </div>

      <UserMessageCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateMessage}
      />
    </div>
  );
}

export default UserMessageGrid;
