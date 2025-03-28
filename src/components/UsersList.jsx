import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./UsersList.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UsersList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });
  const [isSaving, setIsSaving] = useState(false); // Local loading state for the Save button
  const [deletingUsers, setDeletingUsers] = useState({});

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  const fetchUsers = async (pageNumber) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://reqres.in/api/users?page=${pageNumber}`
      );
      const data = await response.json();
      setUsers(data.data);
      setTotalPages(data.total_pages);
    } catch (error) {
      toast.error("Failed to fetch users.");
    }
    setLoading(false);
  };

  const handleLogout = () => {
    toast.success("Good Bye!");
    setTimeout(() => {
      localStorage.removeItem("token");
      navigate("/");
    }, 1500);
  };

  const handleEditClick = (user) => {
    setEditingUser(user.id);
    setEditForm({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
    });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSave = async (id) => {
    setIsSaving(true); // Set saving state to true when save operation starts
    try {
      const response = await fetch(`https://reqres.in/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        setUsers(
          users.map((user) =>
            user.id === id ? { ...user, ...editForm } : user
          )
        );
        toast.success(
          "User Details Updated! Note: Changes may reset on refresh due to test API limitations."
        );
        setEditingUser(null);
      } else {
        toast.error("Failed to update user.");
      }
    } catch {
      toast.error("Something went wrong!");
    }
    setIsSaving(false); // Reset saving state when save operation completes
  };

  const handleDelete = async (id) => {
    setDeletingUsers((prevState) => ({ ...prevState, [id]: true }));
    try {
      const response = await fetch(`https://reqres.in/api/users/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setUsers(users.filter((user) => user.id !== id));
        toast.success(
          "User deleted! Note: Changes may reset on refresh due to test API limitations."
        );
      } else {
        toast.error("Failed to delete user.");
      }
    } catch {
      toast.error("Something went wrong!");
    }
    setDeletingUsers((prevState) => ({ ...prevState, [id]: false }));
  };

  if (localStorage.getItem("token")) {
    return (
      <div className="users-main">
        <ToastContainer />
        <nav className="navbar">
          <h2>GGSL</h2>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </nav>
        {loading && <center><h4 className="loading-text">Loading...</h4></center>}

        <div className="users-grid">
          {users.map((user) => (
            <div key={user.id} className="user-card">
              <img
                src={user.avatar}
                alt={user.first_name}
                className="user-avatar"
              />
              {editingUser === user.id ? (
                <div className="edit-form">
                  <input
                    type="text"
                    name="first_name"
                    value={editForm.first_name}
                    onChange={handleEditChange}
                  />
                  <input
                    type="text"
                    name="last_name"
                    value={editForm.last_name}
                    onChange={handleEditChange}
                  />
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleEditChange}
                  />
                  <button
                    className="save-btn"
                    onClick={() => handleEditSave(user.id)}
                    disabled={isSaving}
                  >
                    {isSaving ? <span className="loader"></span> : "Save"}
                  </button>
                  <button
                    className="cancel-btn"
                    onClick={() => setEditingUser(null)}
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <h3>
                    {user.first_name} {user.last_name}
                  </h3>
                  <p>{user.email}</p>
                  <div className="user-actions">
                    <button
                      className="edit-btn"
                      onClick={() => handleEditClick(user)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(user.id)}
                      disabled={deletingUsers[user.id]}
                    >
                      {deletingUsers[user.id] ? (
                        <span className="loader"></span>
                      ) : (
                        "Delete"
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>
            Prev
          </button>
          <span>
            {" "}
            Page {page} of {totalPages}{" "}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    );
  }
  else{
    return (
      <div className="users-main">
         
         <center><h1>Not Authorized</h1></center>
        
      </div>
    );
  }
};

export default UsersList;
