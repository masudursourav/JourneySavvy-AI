import axios from "axios";
export interface UserInfo {
  email: string;
  name: string;
  picture: string;
  sub: string;
}
// Get user info from localStorage
export const getUserInfo = (): UserInfo | null => {
  const userInfo = localStorage.getItem("userInfo");
  return userInfo ? JSON.parse(userInfo) : null;
};

// Check if user is authenticated
export const isUserAuthenticated = (): boolean => {
  const user = localStorage.getItem("user");
  const userInfo = getUserInfo();
  return !!(user && userInfo);
};

// Clear all user data
export const clearUserData = (): void => {
  localStorage.removeItem("user");
  localStorage.removeItem("userInfo");
};

// Save user info to localStorage
export const saveUserInfo = (userInfo: UserInfo): void => {
  localStorage.setItem("userInfo", JSON.stringify(userInfo));
};

// Fetch user information from Google API
export const fetchUserInfo = async (): Promise<UserInfo | null> => {
  const user = localStorage.getItem("user");
  if (!user) return null;

  try {
    const userData = JSON.parse(user);
    const response = await axios.get(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${userData.access_token}`,
      {
        headers: {
          Authorization: `Bearer ${userData.access_token}`,
          Accept: "application/json",
        },
      }
    );

    console.log("User data fetched:", response.data);
    // Store user info in localStorage using utility function
    saveUserInfo(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    // If token is invalid, clear user data using utility function
    clearUserData();
    return null;
  }
};
