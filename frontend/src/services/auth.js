const API_URL = import.meta.env.VITE_API_URL;
export async function register(formData) {
  const response = await fetch(API_URL+"/utilisateurs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
  console.log("RESPONSE REGISTER: ",response);
  
  return response;
}

export async function login(formData) {
  const response = await fetch(API_URL+ "/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
  return response;
}


