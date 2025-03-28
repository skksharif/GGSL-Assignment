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
  const [editForm, setEditForm] = useState({ first_name: "", last_name: "", email: "" });

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  const fetchUsers = async (pageNumber) => {
    setLoading(true);
    try {
      const response = await fetch(`https://reqres.in/api/users?page=${pageNumber}`);
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
    }, 1500); // Delay to allow toast to show
  };

  const handleEditClick = (user) => {
    setEditingUser(user.id);
    setEditForm({ first_name: user.first_name, last_name: user.last_name, email: user.email });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSave = async (id) => {
    try {
      const response = await fetch(`https://reqres.in/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        setUsers(users.map(user => user.id === id ? { ...user, ...editForm } : user));
        toast.success("User Details Updated! But Changes may reset on refresh due to test API");
        setEditingUser(null);
      } else {
        toast.error("Failed to update user.");
      }
    } catch {
      toast.error("Something went wrong!");
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`https://reqres.in/api/users/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setUsers(users.filter(user => user.id !== id));
        toast.success("User deleted! But Changes may reset on refresh due to test API)");
      } else {
        toast.error("Failed to delete user.");
      }
    } catch {
      toast.error("Something went wrong!");
    }
  };

  return (
    <>
      <ToastContainer />
      <nav className="navbar">
        <h2>GGSL</h2>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </nav>

      <h2 className="page-title">Users List</h2>

      <div className="users-grid">
        {users.map((user) => (
          <div key={user.id} className="user-card">
            <img src={user.avatar} alt={user.first_name} className="user-avatar" />
            {editingUser === user.id ? (
              <div className="edit-form">
                <input type="text" name="first_name" value={editForm.first_name} onChange={handleEditChange} />
                <input type="text" name="last_name" value={editForm.last_name} onChange={handleEditChange} />
                <input type="email" name="email" value={editForm.email} onChange={handleEditChange} />
                <button className="save-btn" onClick={() => handleEditSave(user.id)}>Save</button>
                <button className="cancel-btn" onClick={() => setEditingUser(null)}>Cancel</button>
              </div>
            ) : (
              <>
                <h3>{user.first_name} {user.last_name}</h3>
                <p>{user.email}</p>
                <div className="user-actions">
                  <button className="edit-btn" onClick={() => handleEditClick(user)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(user.id)}>Delete</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
        <span> Page {page} of {totalPages} </span>
        <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</button>
      </div>

      {loading && <p className="loading-text">Loading...</p>}
    </>
  );
};

export default UsersList;
