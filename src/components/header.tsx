import React, { memo } from "react";
import Link from "next/link";

import headerStyles from "../styles/header.module.scss";
import Logo from "../../public/assets/logo.svg";

const Header = () => (
  <>
    <div className={headerStyles.header__link}>
      <Link href="/en-US" locale="en-US">
        English
      </Link>
      <Link href="/hu-HU" locale="hu-HU">
        Magyar
      </Link>
    </div>

    <section className={headerStyles.header__logo}>
      <Logo />
    </section>
  </>
);

export default memo(Header);
