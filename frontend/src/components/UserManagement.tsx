import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { debounce } from 'lodash';
import Pagination from './Pagination';

interface User {
  id: number;
  name: string;
  email: string;
}

interface Friend {
  id: number;
  name: string;
  email: string;
}

function UserManagement() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [friendsCurrentPage, setFriendsCurrentPage] = useState(1);
  const [friendsTotalPages, setFriendsTotalPages] = useState(1);
  const [searchCurrentPage, setSearchCurrentPage] = useState(1);
  const [searchTotalPages, setSearchTotalPages] = useState(1);

  useEffect(() => {
    fetchUserDetails();
    fetchFriends(friendsCurrentPage);
  }, [id, friendsCurrentPage]);

  const fetchUserDetails = async () => {
    try {
      const response = await fetch(`http://localhost:8787/users/${id}`);
      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const fetchFriends = async (page: number) => {
    try {
      const response = await fetch(`http://localhost:8787/users/${id}/friends?page=${page}`);
      const data = await response.json();
      setFriends(data.friends);
      setFriendsTotalPages(data.totalPages);
      setFriendsCurrentPage(data.currentPage);
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  const searchUsers = async (query: string, page: number) => {
    if (!query.trim()) {
      setSearchResults([]);
      setSearchTotalPages(1);
      return;
    }
    try {
      const response = await fetch(`http://localhost:8787/users/search?q=${query}&page=${page}`);
      const data = await response.json();
      setSearchResults(data.users);
      setSearchTotalPages(data.totalPages);
      setSearchCurrentPage(data.currentPage);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const debouncedSearch = useCallback(
    debounce((query: string) => searchUsers(query, 1), 300),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    debouncedSearch(e.target.value);
  };

  const addFriend = async (friendId: number) => {
    try {
      await fetch(`http://localhost:8787/users/${id}/friends`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId }),
      });
      fetchFriends(friendsCurrentPage);
    } catch (error) {
      console.error('Error adding friend:', error);
    }
  };

  const removeFriend = async (friendId: number) => {
    if (window.confirm('Are you sure you want to remove this friend?')) {
      try {
        await fetch(`http://localhost:8787/users/${id}/friends/${friendId}`, {
          method: 'DELETE',
        });
        fetchFriends(friendsCurrentPage);
      } catch (error) {
        console.error('Error removing friend:', error);
      }
    }
  };

  const isFriend = (userId: number) => friends.some(friend => friend.id === userId);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Manage User: {user.name}</h1>
      <div className="bg-white rounded-lg shadow-xl p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">User Details</h2>
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-xl p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Friends</h2>
        {friends.length > 0 ? (
          <>
            <ul>
              {friends.map((friend) => (
                <li key={friend.id} className="flex justify-between items-center mb-2">
                  <span>{friend.name} ({friend.email})</span>
                  <button
                    onClick={() => removeFriend(friend.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            <Pagination
              currentPage={friendsCurrentPage}
              totalPages={friendsTotalPages}
              onPageChange={setFriendsCurrentPage}
            />
          </>
        ) : (
          <p className="text-gray-600 italic">
            You don't have any friends yet. Use the search below to find and add friends!
          </p>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-xl p-6">
        <h2 className="text-2xl font-semibold mb-4">Add Friend</h2>
        <div className="mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full p-2 border rounded"
            placeholder="Search users..."
          />
        </div>
        <ul>
          {searchResults.map((result) => (
            <li key={result.id} className="flex justify-between items-center mb-2">
              <span>{result.name} ({result.email})</span>
              {result.id === parseInt(id!) ? (
                <span className="text-gray-500 italic">Current User</span>
              ) : isFriend(result.id) ? (
                <button
                  onClick={() => removeFriend(result.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  Remove
                </button>
              ) : (
                <button
                  onClick={() => addFriend(result.id)}
                  className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                >
                  Add
                </button>
              )}
            </li>
          ))}
        </ul>
        {searchResults.length > 0 && (
          <Pagination
            currentPage={searchCurrentPage}
            totalPages={searchTotalPages}
            onPageChange={(page) => searchUsers(searchTerm, page)}
          />
        )}
      </div>
      
      <button
        onClick={() => navigate('/admin')}
        className="mt-8 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
      >
        Back to Admin Panel
      </button>
    </div>
  );
}

export default UserManagement;