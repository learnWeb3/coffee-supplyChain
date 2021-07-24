import Home from "../Home/index";
import SignPage from "../SignPage/index";

const navigateTo = (path, contract, currentAddress) => {
  const routes = {
    home: {
      path: "/home",
      component: () =>
        new Home("#root", "home", contract, currentAddress),
    },
    sign: {
      path: "/sign",
      component: () =>
        new SignPage("#root", "signPage", contract, currentAddress),
    },
  };
  routes[path].component();
};

export default navigateTo;
