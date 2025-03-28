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
  const [isSaving, setIsSaving] = useState(false);
  const [deletingUsers, setDeletingUsers] = useState({});
  const [searchQuery, setSearchQuery] = useState(""); // State for search input

  useEffect(() => {
    fetchUsers(page);
  }, [page]);


  // Fetching Users Based on Page Number ( Note : 1 and 2 only)
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

  //Just Clearing token and Navigating to Login Page to Logout
  const handleLogout = () => {
    toast.success("Good Bye!");
    
    //setTimeout() used for delaying the navigation to show the toast message.
    setTimeout(() => {
      localStorage.removeItem("token");
      navigate("/");
    }, 1500);
  };

  // On Clicking Edit button 
  const handleEditClick = (user) => {
    setEditingUser(user.id); // Setting the editingUser with user id
    setEditForm({ first_name: user.first_name, last_name: user.last_name, email: user.email });
  };

 //Taking Input for updating a user
  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // Final Saving after Updating user  through edit form
  const handleEditSave = async (id) => {
    setIsSaving(true);
    try {
      const response = await fetch(`https://reqres.in/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        setUsers(users.map(user => user.id === id ? { ...user, ...editForm } : user));
        toast.success("User Details Updated! Note: Changes may reset on refresh due to test API limitations.");
        setEditingUser(null);
      } else {
        toast.error("Failed to update user.");
      }
    } catch {
      toast.error("Something went wrong!");
    }
    setIsSaving(false);
  };

  //Deleting the user
  const handleDelete = async (id) => {
    setDeletingUsers(prevState => ({ ...prevState, [id]: true }));
    try {
      const response = await fetch(`https://reqres.in/api/users/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setUsers(users.filter(user => user.id !== id));
        toast.success("User deleted! Note: Changes may reset on refresh due to test API limitations.");
      } else {
        toast.error("Failed to delete user.");
      }
    } catch {
      toast.error("Something went wrong!");
    }
    setDeletingUsers(prevState => ({ ...prevState, [id]: false }));
  };

  // Search Filter Function
  const filteredUsers = users.filter(user =>
    `${user.first_name} ${user.last_name} ${user.email}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="users-main">
      <ToastContainer />
      <nav className="navbar">
        <h2>GGSL</h2>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </nav>

      {/* Search Bar */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="users-container">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div key={user.id} className="user-card">
              <img src={user.avatar} alt={user.first_name} className="user-avatar" />

              {/* Edit Form VS User Data*/}
              {editingUser === user.id ? (
                
                <div className="edit-form">
                  <input type="text" name="first_name" value={editForm.first_name} onChange={handleEditChange} />
                  <input type="text" name="last_name" value={editForm.last_name} onChange={handleEditChange} />
                  <input type="email" name="email" value={editForm.email} onChange={handleEditChange} />
                  <button className="save-btn" onClick={() => handleEditSave(user.id)} disabled={isSaving}>
                    {isSaving ? <span className="loader"></span> : "Save"}
                  </button>
                  <button className="cancel-btn" onClick={() => setEditingUser(null)} disabled={isSaving}>Cancel</button>
                </div>
              ) : (
                <>
                  <h3 className="user-name">{user.first_name} {user.last_name}</h3>
                  <p className="user-email">{user.email}</p>
                  <div className="user-actions">
                    <button className="edit-btn" onClick={() => handleEditClick(user)}>Edit</button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(user.id)}
                      disabled={deletingUsers[user.id]}
                    >
                      {deletingUsers[user.id] ? <span className="loader"></span> : "Delete"}
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        ) : (
          <p className="no-results">No users found.</p>
        )}
      </div>

      {/* Pagination Setup Upto 2 pages only */}
      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
        <span> Page {page} of {totalPages} </span>
        <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</button>
      </div>

      {loading && <p className="loading-text">Loading...</p>}
    </div>
  );
};

export default UsersList;
