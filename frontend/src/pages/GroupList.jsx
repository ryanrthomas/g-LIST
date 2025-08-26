import { connectSocket, disconnectSocket } from "../services/socketClient";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../css/grocery.css";
import GroupCodeFooter from "../components/GroupCodeFooter";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE_URL_DEV;

function GroupList() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: "", quantity: 1, price: "", status: "NEEDED" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [group, setGroup] = useState(null);

  const [currentModal, setCurrentModal] = useState(""); // "", "addItem", "invite", "groupInvitations", "groupRespond"

  const [inviteUserCode, setInviteUserCode] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");

  const [groupSentInvitations, setGroupSentInvitations] = useState([]);
  const [groupReceivedInvitations, setGroupReceivedInvitations] = useState([]);
  const [loadingGroupInvitations, setLoadingGroupInvitations] = useState(false);
  const [groupInvitationsError, setGroupInvitationsError] = useState("");
  const [groupRespondType, setGroupRespondType] = useState(""); // "sent" | "received"
  const [groupRespondData, setGroupRespondData] = useState({});

  const navigate = useNavigate();
  const { groupId } = useParams();

    // Delete account handler
  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This cannot be undone.")) return;
    const userId = localStorage.getItem("user_id");
    const accessToken = localStorage.getItem("access_token");
    if (!userId || !accessToken) {
      alert("Not logged in.");
      return;
    }
    try {
      await axios.delete(`${API_BASE_URL}/users/${userId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      alert("Account deleted. Goodbye!");
      localStorage.removeItem("user_id");
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_code");
      disconnectSocket();
      window.dispatchEvent(new Event("user-auth-changed"));
      navigate("/");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete account.");
    }
  };

  const handleInviteToGroup = async () => {
    if (!inviteUserCode.trim()) {
      alert("Please enter a user code.");
      return;
    }
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      alert("Not logged in.");
      return;
    }
    try {
      await axios.post(
        `${API_BASE_URL}/invitations/group-invite`,
        {
          to_user_code: inviteUserCode.trim(),
          from_group_id: groupId,
          message: inviteMessage.trim()
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      alert("Invitation sent!");
      setInviteUserCode("");
      setInviteMessage("");
      setCurrentModal(""); 
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to send invitation.");
    }
  };

  const handleLeaveGroup = async () => {
    if (!window.confirm("Are you sure you want to leave this group?")) return;
    
    const accessToken = localStorage.getItem("access_token");
    const userId = localStorage.getItem("user_id");
    if (!accessToken || !userId) {
      alert("Not logged in.");
      return;
    }
    
    try {
      await axios.delete(`${API_BASE_URL}/groups/${groupId}/leave`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      alert("Left group successfully!");
      navigate("/groups");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to leave group.");
    }
  };

  const handleDisbandGroup = async () => {
    if (!window.confirm("Are you sure you want to disband this group? This action cannot be undone and will remove all members.")) return;
    
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      alert("Not logged in.");
      return;
    }
    
    try {
      await axios.delete(`${API_BASE_URL}/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      alert("Group disbanded successfully!");
      navigate("/groups");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to disband group.");
    }
  };

  const fetchGroupInvitations = () => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      setGroupInvitationsError("Not logged in.");
      setLoadingGroupInvitations(false);
      return;
    }
    setLoadingGroupInvitations(true);
    axios.get(`${API_BASE_URL}/groups/${groupId}/invitations`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
      .then(res => {
        const historyData = res.data.data || {};
        const allInvitations = historyData.invitations || [];
        
        // Split based on invitation_type
        const sentInvites = allInvitations.filter(inv => inv.type === 'GROUP_INVITE');
        const receivedRequests = allInvitations.filter(inv => inv.type === 'JOIN_REQUEST');
        
        setGroupSentInvitations(sentInvites); // Invites sent to people to join group
        setGroupReceivedInvitations(receivedRequests); // Join requests from people wanting to join
        setLoadingGroupInvitations(false);
      })
      .catch(err => {
        setGroupInvitationsError("Failed to load group invitations.");
        setLoadingGroupInvitations(false);
      });
  };

  const handleAddItem = () => {
    setCurrentModal("addItem");
    setNewItem({ name: "", quantity: 1, price: "", status: "NEEDED" });
  };

  const handleOpenGroupInvitations = () => {
    setCurrentModal("groupInvitations");
    fetchGroupInvitations();
  };

  const handleGroupSentInvitationClick = (inv) => {
    setGroupRespondType("sent");
    setGroupRespondData(inv);
    setCurrentModal("groupRespond");
  };

  const handleGroupReceivedInvitationClick = (inv) => {
    setGroupRespondType("received");
    setGroupRespondData(inv);
    setCurrentModal("groupRespond");
  };

  const handleGroupAccept = async () => {
    if (!groupRespondData?.id) {
      alert("No invitation selected.");
      return;
    }
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      alert("Not logged in.");
      return;
    }
    try {
      await axios.put(
        `${API_BASE_URL}/invitations/${groupRespondData.id}/accept`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      alert("Invitation accepted!");
      setCurrentModal("");
      fetchGroupInvitations();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to accept invitation.");
    }
  };

  const handleGroupDeclineOrCancel = async () => {
    if (!groupRespondData?.id) {
      alert("No invitation selected.");
      return;
    }
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      alert("Not logged in.");
      return;
    }
    try {
      await axios.put(
        `${API_BASE_URL}/invitations/${groupRespondData.id}/decline`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      alert(groupRespondType === "sent" ? "Invitation canceled!" : "Invitation declined!");
      setCurrentModal("");
      fetchGroupInvitations();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update invitation.");
    }
  };

  const handleEditItem = (item) => {
    setNewItem({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      status: item.status
    });
    setCurrentModal("editItem"); 
  };

  const handleEditSubmit = async () => {
    if (!newItem.name.trim() || newItem.quantity < 1 || newItem.price < 0) {
      alert("Please fill out valid Name, Quantity, and Price.");
      return;
    }
    const accessToken = localStorage.getItem("access_token");
    try {
      await axios.put(
        `${API_BASE_URL}/items/${newItem.id}`,
        {
          item_name: newItem.name,
          item_quantity: newItem.quantity,
          item_price: newItem.price,
          item_status: newItem.status
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      
      // Update local state
      setItems(items => items.map(item => 
        item.id === newItem.id 
          ? {
              ...item,
              name: newItem.name,
              quantity: newItem.quantity,
              price: newItem.price,
              status: newItem.status
            }
          : item
      ));
      
      setCurrentModal("");
      alert("Item updated successfully!");
    } catch (err) {
      alert("Failed to update item: " + (err.response?.data?.message || err.message));
    }
  };
  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      alert("Not logged in.");
      return;
    }
    
    try {
      await axios.delete(`${API_BASE_URL}/items/${itemId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      // Remove item from local state
      setItems(items => items.filter(item => item.id !== itemId));
      alert("Item deleted successfully!");
    } catch (err) {
      alert("Failed to delete item: " + (err.response?.data?.message || err.message));
    }
  };

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    const userId = localStorage.getItem("user_id");

    if (!accessToken || !userId) return;

    console.log('Connecting socket for group:', groupId);
    const socket = connectSocket(accessToken);
    
    // Wait for connection before joining rooms
    const setupSocket = () => {
      console.log('Socket connected, joining group room');
      socket.emit('join-group', groupId);
    };

    // If already connected, setup immediately
    if (socket.connected) {
      setupSocket();
    } else {
      // Wait for connection
      socket.on('connect', setupSocket);
    }
    
    // Function to refetch the list (reuse the exact same logic as the original useEffect)
    const refetchList = () => {
      console.log('Real-time update: Refetching group list');
      const accessToken = localStorage.getItem("access_token");
      axios.get(`${API_BASE_URL}/groups/${groupId}/list`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
        .then(res => {
          const data = res.data.data;
          if (data && Array.isArray(data.Items)) {
            setItems(data.Items.map(item => ({
              id: item.id,
              name: item.item_name,
              quantity: item.item_quantity,
              price: item.item_price ? Number(item.item_price) : 0,
              status: item.item_status,
              purchased: item.item_status === "PURCHASED"
            })));
          } else {
            setItems([]);
          }
        })
        .catch(() => {
          console.log('Failed to refetch list after real-time update');
        });
    };
    
    // Listen for real-time events
    socket.on('list:item_added', refetchList);
    socket.on('list:item_updated', refetchList);
    socket.on('list:item_deleted', refetchList);
    socket.on('list:cleared', refetchList);
    
    return () => {
      console.log('Cleaning up socket for group:', groupId);
      socket.off('list:item_added');
      socket.off('list:item_updated');
      socket.off('list:item_deleted');
      socket.off('list:cleared');
      socket.emit('leave-group', groupId);
    };
  }, [groupId]);

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      setError("No user ID found. Please log in.");
      setLoading(false);
      return;
    }
    const accessToken = localStorage.getItem("access_token");
    axios.get(`${API_BASE_URL}/groups/${groupId}`,
      { headers: { Authorization: `Bearer ${accessToken}` } })
      .then(res => setGroup(res.data.data))
      .catch(() => setGroup(null));
    axios.get(`${API_BASE_URL}/groups/${groupId}/list`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
      .then(res => {
        const data = res.data.data;
        if (data && Array.isArray(data.Items)) {
          setItems(data.Items.map(item => ({
            id: item.id,
            name: item.item_name,
            quantity: item.item_quantity,
            price: item.item_price ? Number(item.item_price) : 0,
            status: item.item_status,
            purchased: item.item_status === "PURCHASED"
          })));
        } else {
          setItems([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch group list.");
        setLoading(false);
      });
  }, [groupId]);

  useEffect(() => {
    if (currentModal) {
      // Lock body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [currentModal]);

  const expectedTotal = items.reduce((total, item) => {
    if (item.status === "NEEDED" || item.status === "OPTIONAL") {
      return total + item.price * item.quantity;
    }
    return total;
  }, 0);

  const handleCheckbox = async (itemId) => {
    if (!itemId) {
      alert("Error: Item ID is undefined. Cannot update status.");
      return;
    }
    const accessToken = localStorage.getItem("access_token");
    const idx = items.findIndex(it => it.id === itemId);
    if (idx === -1) return;
    const item = items[idx];
    const newStatus = item.purchased ? "NEEDED" : "PURCHASED";
    try {
      await axios.put(
        `${API_BASE_URL}/items/${item.id}/status`,
        { item_status: newStatus },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setItems(items => items.map((it, i) =>
        i === idx ? { ...it, purchased: !it.purchased, status: newStatus } : it
      ));
    } catch (err) {
      alert("Failed to update item status: " + (err.response?.data?.message || err.message));
    }
  };

  const handleClear = async () => {
    if (window.confirm("Are you sure you want to clear the entire list?")) {
      const accessToken = localStorage.getItem("access_token");
      try {
        await axios.put(
          `${API_BASE_URL}/groups/${groupId}/list/clear`,
          {},
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        setItems([]);
      } catch (err) {
        alert("Failed to clear list: " + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setNewItem(item => ({ ...item, [name]: name === "quantity" || name === "price" ? Number(value) : value }));
  };

  const handleModalSubmit = async () => {
    if (!newItem.name.trim() || newItem.quantity < 1 || newItem.price < 0) {
      alert("Please fill out valid Name, Quantity, and Price.");
      return;
    }
    const accessToken = localStorage.getItem("access_token");
    try {
      await axios.post(
        `${API_BASE_URL}/groups/${groupId}/list/items`,
        {
          item_name: newItem.name,
          item_quantity: newItem.quantity,
          item_price: newItem.price,
          item_status: newItem.status
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      // Optionally, fetch the updated list from backend
      setLoading(true);
      axios.get(`${API_BASE_URL}/groups/${groupId}/list`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
        .then(res => {
          const data = res.data.data;
          if (data && Array.isArray(data.Items)) {
            setItems(data.Items.map(item => ({
              id: item.id,
              name: item.item_name,
              quantity: item.item_quantity,
              price: item.item_price ? Number(item.item_price) : 0,
              status: item.item_status,
              purchased: item.item_status === "PURCHASED"
            })));
          } else {
            setItems([]);
          }
          setLoading(false);
        })
        .catch(() => {
          setError("Failed to fetch group list.");
          setLoading(false);
        });
      setCurrentModal("");
    } catch (err) {
      alert("Failed to add item: " + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
      <nav className="top-nav">
        <div className="nav-links" style={{ display: 'flex', alignItems: 'center' }}>
          <a href="#" style={{ marginRight: 16, color: 'red', fontWeight: 600 }} onClick={e => { e.preventDefault(); handleDeleteAccount(); }}>Delete Account</a>
          <a href="/welcome" onClick={e => { e.preventDefault(); navigate("/welcome"); }}>My List</a>
          <a href="/groups" onClick={e => { e.preventDefault(); navigate("/groups"); }}>View Groups</a>
          <a href="#" className="signout" onClick={e => {
            e.preventDefault();
            localStorage.removeItem("user_id");
            localStorage.removeItem("access_token");
            localStorage.removeItem("user_code");
            disconnectSocket();
            window.dispatchEvent(new Event("user-auth-changed"));
            navigate("/");
          }}>Sign Out</a>
        </div>
        <div className="group-nav-buttons" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button 
            className="btn" 
            style={{ padding: "4px 8px", fontSize: "0.9rem" }}
            onClick={() => setCurrentModal("invite")} 
          >
            👥 Invite to Group
          </button>
          <button 
            className="btn" 
            style={{ padding: "4px 8px", fontSize: "0.9rem" }}
            onClick={handleOpenGroupInvitations}
          >
            📩 Invitations
          </button>
          <button 
            className="btn" 
            style={{ padding: "4px 8px", fontSize: "0.9rem", backgroundColor: "#f39c12" }}
            onClick={handleLeaveGroup}
          >
            🚪 Leave Group
          </button>
          <button 
            className="btn clear" 
            style={{ padding: "4px 8px", fontSize: "0.9rem" }}
            onClick={handleDisbandGroup}
          >
            💥 Disband Group
          </button>
        </div>
      </nav>
      <main className="list-container">
        <h1>{group ? group.group_name : "Group List"}</h1>
        {items.length === 0 ? (
          <p style={{ textAlign: "center", margin: "32px 0" }}>No items in this group list yet.</p>
        ) : (
          <table className="item-table">
            <thead>
              <tr>
                <th>Purchased</th>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className={item.purchased ? "purchased" : ""}>
                  <td><input type="checkbox" checked={item.purchased} onChange={() => handleCheckbox(item.id)} /></td>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>${item.price.toFixed(2)}</td>
                  <td>{item.status}</td>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <button 
                        className="action-btn edit-btn"
                        onClick={() => handleEditItem(item)}
                        style={{
                          background: "var(--warm-taupe)",
                          border: "none",
                          cursor: item.purchased ? "not-allowed" : "pointer",
                          fontSize: "0.9rem",
                          color: "white",
                          padding: "4px 8px",
                          borderRadius: "4px"
                        }}
                        title="Edit item"
                      >
                        Edit
                      </button>
                      <button 
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteItem(item.id)}
                        style={{
                          background: "var(--warm-taupe)",
                          border: "none",
                          cursor: item.purchased ? "not-allowed" : "pointer",
                          fontSize: "0.9rem",
                          color: "white",
                          padding: "4px 8px",
                          borderRadius: "4px"
                        }}
                        title="Delete item"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="buttons">
          <button className="btn" onClick={handleAddItem}>Add Item</button>
          <button className="btn clear" onClick={handleClear}>Clear List</button>
        </div>
      </main>
      <section className="totals-container">
        <h2>Expected Total</h2>
        <p id="expectedTotal">${expectedTotal.toFixed(2)}</p>
      </section>
      <GroupCodeFooter/>
      {currentModal === "addItem" && (
        <div className="modal" style={{ display: "block" }} onClick={() => setCurrentModal("")}>
          <div className="modal-content">
            <h3>Add New Item</h3>
            <input type="text" name="name" value={newItem.name} onChange={handleModalChange} placeholder="Item Name" />
            <input type="number" name="quantity" value={newItem.quantity} onChange={handleModalChange} placeholder="Quantity" min="1" />
            <input type="number" name="price" value={newItem.price} onChange={handleModalChange} placeholder="Price ($)" min="0" step="0.01" />
            <select name="status" value={newItem.status} onChange={handleModalChange}>
              <option value="NEEDED">NEEDED</option>
              <option value="OPTIONAL">OPTIONAL</option>
            </select>
            <div className="modal-buttons">
              <button className="btn" onClick={handleModalSubmit}>Submit</button>
              <button className="btn clear" onClick={() => setCurrentModal("")}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {currentModal === "invite" && (
        <div className="modal" style={{ display: "block" }} onClick={() => setCurrentModal("")}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <span className="close" onClick={() => setCurrentModal("")}>&times;</span>
            <h3>Invite to {group ? group.group_name : "Group"}</h3>
            
            <label>User Code</label>
            <input 
              type="text" 
              value={inviteUserCode} 
              onChange={e => setInviteUserCode(e.target.value)} 
              placeholder="Enter user code"
            />
            
            <label>Message (optional)</label>
            <textarea 
              value={inviteMessage} 
              onChange={e => setInviteMessage(e.target.value)} 
              placeholder="Add a message..."
              style={{
                padding: "10px",
                border: "1px solid var(--warm-taupe)",
                borderRadius: "6px",
                fontSize: "1rem",
                fontFamily: "var(--font-main)",
                minHeight: "80px",
                resize: "vertical"
              }}
            />
            
            <div className="modal-buttons">
              <button className="btn" onClick={handleInviteToGroup}>Send Invitation</button>
              <button className="btn clear" onClick={() => setCurrentModal("")}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {currentModal === "groupInvitations" && (
        <div className="modal" style={{ display: "block" }} onClick={() => setCurrentModal("")}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <span className="close" onClick={() => setCurrentModal("")}>&times;</span>
            <h3>{group ? `${group.group_name} Invitations` : "Group Invitations"}</h3>
            {loadingGroupInvitations && <div>Loading invitations...</div>}
            {groupInvitationsError && <div style={{ color: 'red' }}>{groupInvitationsError}</div>}
            <div className="invitation-list">
              <h4>Invites Sent</h4>
              <ul style={{ listStyle: "none", padding: 0, maxHeight: "150px", overflowY: "auto" }}>
                {groupSentInvitations.length === 0 && <li>No invites sent to join this group.</li>}
                {groupSentInvitations.map((inv, idx) => {
                  const fromName = inv.FromUser
                    ? `${inv.FromUser.first_name || ''} ${inv.FromUser.last_name || ''}`.trim()
                    : "Unknown";
                  const toName = inv.ToUser
                    ? `${inv.ToUser.first_name || ''} ${inv.ToUser.last_name || ''}`.trim()
                    : "Unknown";
                  
                  const statusColor = inv.status === 'ACCEPTED' ? '#28a745' : 
                                    inv.status === 'DECLINED' ? '#dc3545' : 
                                    '#ffc107';
                  
                  return (
                    <li 
                      key={inv.id || idx} 
                      style={{
                        padding: "8px",
                        margin: "4px 0",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        cursor: "pointer",
                        backgroundColor: "#f9f9f9"
                      }}
                      onClick={() => handleGroupSentInvitationClick(inv)}
                    >
                      <div style={{ fontSize: "0.9em" }}>
                        <strong>{fromName}</strong> invited <strong>{toName}</strong>
                        {inv.message && <div style={{ fontStyle: "italic", margin: "2px 0" }}>"{inv.message}"</div>}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
                          <span style={{ fontSize: "0.8em", color: "#666" }}>
                            {new Date(inv.created_at).toLocaleDateString()}
                          </span>
                          <span style={{ 
                            fontSize: "0.8em", 
                            color: statusColor,
                            fontWeight: "bold",
                            padding: "1px 4px",
                            borderRadius: "3px",
                            backgroundColor: `${statusColor}20`
                          }}>
                            {inv.status || "PENDING"}
                          </span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
              
              <h4>Join Requests Received </h4>
              <ul style={{ listStyle: "none", padding: 0, maxHeight: "150px", overflowY: "auto" }}>
                {groupReceivedInvitations.length === 0 && <li>No join requests received.</li>}
                {groupReceivedInvitations.map((inv, idx) => {
                  const fromName = inv.FromUser
                    ? `${inv.FromUser.first_name || ''} ${inv.FromUser.last_name || ''}`.trim()
                    : "Unknown";
                  
                  const statusColor = inv.status === 'ACCEPTED' ? '#28a745' : 
                                    inv.status === 'DECLINED' ? '#dc3545' : 
                                    '#ffc107';
                  
                  return (
                    <li 
                      key={inv.id || idx}
                      style={{
                        padding: "8px",
                        margin: "4px 0",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        cursor: "pointer",
                        backgroundColor: "#f9f9f9"
                      }}
                      onClick={() => handleGroupReceivedInvitationClick(inv)}
                    >
                      <div style={{ fontSize: "0.9em" }}>
                        <strong>{fromName}</strong> requested to join
                        {inv.message && <div style={{ fontStyle: "italic", margin: "2px 0" }}>"{inv.message}"</div>}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
                          <span style={{ fontSize: "0.8em", color: "#666" }}>
                            {new Date(inv.created_at).toLocaleDateString()}
                          </span>
                          <span style={{ 
                            fontSize: "0.8em", 
                            color: statusColor,
                            fontWeight: "bold",
                            padding: "1px 4px",
                            borderRadius: "3px",
                            backgroundColor: `${statusColor}20`
                          }}>
                            {inv.status || "PENDING"}
                          </span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      )}
      {currentModal === "groupRespond" && (
        <div className="modal" style={{ display: "block" }} onClick={() => setCurrentModal("")}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <span className="close" onClick={() => setCurrentModal("groupInvitations")}>&times;</span>
            <h3>{groupRespondData.groupName || groupRespondData.group || "Invitation"}</h3>
            <p>{groupRespondData.message}</p>
            <div className="modal-buttons">
              {groupRespondType === "received" && (
                <>
                  <button className="btn" onClick={handleGroupAccept}>Accept ✅</button>
                  <button className="btn clear" onClick={handleGroupDeclineOrCancel}>Decline ❌</button>
                </>
              )}
              {groupRespondType === "sent" && (
                <button className="btn clear" onClick={handleGroupDeclineOrCancel}>Cancel ❌</button>
              )}
            </div>
          </div>
        </div>
      )}
      {currentModal === "editItem" && (
        <div className="modal" style={{ display: "block" }} onClick={() => setCurrentModal("")}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Edit Item</h3>
            <input type="text" name="name" value={newItem.name} onChange={handleModalChange} placeholder="Item Name" />
            <input type="number" name="quantity" value={newItem.quantity} onChange={handleModalChange} placeholder="Quantity" min="1" />
            <input type="number" name="price" value={newItem.price} onChange={handleModalChange} placeholder="Price ($)" min="0" step="0.01" />
            <select name="status" value={newItem.status} onChange={handleModalChange}>
              <option value="NEEDED">NEEDED</option>
              <option value="OPTIONAL">OPTIONAL</option>
            </select>
            <div className="modal-buttons">
              <button className="btn" onClick={handleEditSubmit}>Update</button>
              <button className="btn clear" onClick={() => setCurrentModal("")}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default GroupList;
