import axios from "axios";
export interface UserInfo {
  email: string;
  name: string;
  picture: string;
  sub: string;
}
export const getUserInfo = (): UserInfo | null => {
  const userInfo = localStorage.getItem("userInfo");
  return userInfo ? JSON.parse(userInfo) : null;
};

export const isUserAuthenticated = (): boolean => {
  const user = localStorage.getItem("user");
  const userInfo = getUserInfo();
  return !!(user && userInfo);
};

export const clearUserData = (): void => {
  localStorage.removeItem("user");
  localStorage.removeItem("userInfo");
  window.dispatchEvent(new CustomEvent("authStateChanged"));
};

export const saveUserInfo = (userInfo: UserInfo): void => {
  localStorage.setItem("userInfo", JSON.stringify(userInfo));
  window.dispatchEvent(new CustomEvent("authStateChanged"));
};

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

    saveUserInfo(response.data);
    return response.data;
  } catch {
    clearUserData();
    return null;
  }
};
