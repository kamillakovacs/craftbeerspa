import React, { memo } from "react";

import headerStyles from "../styles/header.module.scss";
import Logo from "../../public/assets/logo.svg";

const Header = () => (
  <section className={headerStyles.header}>
    <Logo />
  </section>
);

export default memo(Header);
