import { createAuthClient } from "better-auth/client";

export const useAuth = () => {
  const authClient = createAuthClient({
    baseURL: useRuntimeConfig().public.apiBase,

    fetchOptions: {
      credentials: "include", // indispensable pour les cookies
    },

  });

  const session = useState<any | null>("session", () => null);

  const loginWithGoogle = async () => {
    await authClient.signIn.social({
      provider: "google",
    });
  };

  const loginWithFacebook = async () => {
    await authClient.signIn.social({ provider: "facebook" });
  };
const createUser = async (
    name: string,
    email: string,
    password: string,
    confirmPassword: string
  ) => {

    if (password !== confirmPassword) {
      throw new Error('Passwords do not match')
    }

    try {

      const result = await authClient.signUp.email({
        name,
        email,
        password
      })

      console.log('Utilisateur créé :', result)

      return result

    } catch (error) {
      console.error('Erreur inscription :', error)
      throw error
    }
  }


  const loginWithEmail = async (
    email: string,
    password: string,
    rememberMe: boolean = true
  ) => {
    const result = await authClient.signIn.email({
      email,
      password,
      rememberMe,
    });
    console.log("Erreur de connexion :", result.error);
    console.log("Erreur de connexion :", result);


    if (result?.error) {
      throw new Error(result.error.message || "Email ou mot de passe incorrect");

    }

    return result;
  };



  const logout = async () => {
    await authClient.signOut();
    session.value = null;
  };

  const fetchSession = async () => {
    try {
      const res: any = await $fetch("/api/me", {
        credentials: "include",
      });

      session.value = res.user || null;
    } catch (error) {
      session.value = null;
    }
  };

  return {
    session,
    loginWithGoogle,
    loginWithFacebook,
    loginWithEmail,
    logout,
    fetchSession,
    createUser,
  };
 

};
