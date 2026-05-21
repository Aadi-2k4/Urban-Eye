// api.js - Frontend API utility for making backend HTTP requests
export async function apiLogin(username, password) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Login failed");
  }
  return response.json();
}

export async function apiSignup(name, username, password) {
  const response = await fetch("/api/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, username, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Signup failed");
  }
  return response.json();
}

export async function apiGetComplaints() {
  const response = await fetch("/api/complaints");
  if (!response.ok) {
    throw new Error("Failed to fetch complaints");
  }
  return response.json();
}

export async function apiSaveComplaint(complaint) {
  const response = await fetch("/api/complaints", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(complaint),
  });

  if (!response.ok) {
    throw new Error("Failed to save complaint");
  }
  return response.json();
}

export async function apiSaveComplaintsBulk(complaints) {
  const response = await fetch("/api/complaints/bulk", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(complaints),
  });

  if (!response.ok) {
    throw new Error("Failed to save complaints bulk");
  }
  return response.json();
}

export async function apiResetComplaints() {
  const response = await fetch("/api/complaints/reset", {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Failed to reset complaints");
  }
  return response.json();
}
