const baseURL = "http://localhost:8001";

function renderUsers(users) {
  const list = document.getElementById("userList");
  list.innerHTML = "";

  users.forEach(user => {
    const li = document.createElement("li");
    li.textContent = `${user.username}: ${user.bio}`;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = async () => {
      await fetch(`${baseURL}/users/${user._id}`, { method: "DELETE" });
      loadUsers();
    };

    li.appendChild(deleteBtn);
    list.appendChild(li);
  });
}

async function loadUsers() {
  const res = await fetch(`${baseURL}/users`);
  const users = await res.json();
  renderUsers(users);

  document.getElementById("userCounts").textContent = `Total users: ${users.length}`;
}

document.getElementById("search").addEventListener("input", async (e) => {
  const term = e.target.value.toLowerCase();
  const res = await fetch(`${baseURL}/users`);
  const users = await res.json();

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(term)
  );

  document.getElementById("userCounts").textContent = `Total users: ${filteredUsers.length}`;
  renderUsers(filteredUsers);
});

document.getElementById("userForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const bio = document.getElementById("bio").value;

  await fetch(`${baseURL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, bio })
  });

  document.getElementById("displayUsername").value = username;
  document.getElementById("displayBio").value = bio;

  e.target.reset();
  loadUsers();
});

loadUsers();
