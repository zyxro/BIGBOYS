const baseURL = "http://localhost:3000" //2024101074 - added this temprorarily

async function loadUsers() {
  const res = await fetch(`${baseURL}/users`);
  const users = await res.json();
  const list = document.getElementById("userList");
  list.innerHTML = "";
  
  document.getElementById("userCounts").textContent = `Total users: ${users.length}`;//Theres a spelling mistake here-2024101074, userCounts should be the element ID not userCount
  // why did I give such a weird task
  users.forEach(user => {
    const li = document.createElement("li");
    li.textContent = `${user.username}: ${user.bio}`;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = async () => {
      await fetch(`${baseURL}/users/${user._id}`, { method: "DELETE" }); //this is an issue-2024101074, {baseURL} is NOT defined anywhere, will cause reference error
      loadUsers();
    };

    li.appendChild(deleteBtn);
    list.appendChild(li);
  });
}

document.getElementById("search").addEventListener("input", async (e) => {
  const term = e.target.value.toLowerCase();
  const res = await fetch(`${baseURL}/users`);
  const users = await res.json();
  const list = document.getElementById("userList");
  list.innerHTML = "";

  const filteredUsers = users.filter(user => user.username.toLowerCase().includes(term));
  document.getElementById("userCount").textContent = `Total users: ${filteredUsers.length}`;

  filteredUsers.forEach(user => {
    const li = document.createElement("li");
    li.textContent = `${user.username}: ${user.bio}`;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = async () => {
      await fetch(`/users/${user._id}`, { method: "DELETE" }); //should be DELETE not PATCH-2024101074
      loadUsers();
    };

    li.appendChild(deleteBtn);
    list.appendChild(li);
  });
});

loadUsers();

document.getElementById("userForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const bio = document.getElementById("bio").value;
  await fetch(`${baseURL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, bio })
  });
  e.target.reset();
  loadUsers();
});