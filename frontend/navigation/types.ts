export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type AuthNavigation = {
  navigate: <T extends keyof AuthStackParamList>(screen: T) => void;
};
