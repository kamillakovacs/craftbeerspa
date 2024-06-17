import React, { FC, memo, useState } from "react";
import classnames from "classnames";
import Image from "next/image";

import downArrow from "../../public/assets/downarrow.png";


interface Props {
  title: string;
  subTitle: string;
  description: string;
}
const Accordion: FC<Props> = ({ title, subTitle, description }) => {
  const [open, setOpen] = useState(false);
  const [inTransition, setInTransition] = useState(false);

  const togglePanel = () => {
    setOpen(!open);
    setInTransition(true);
  };

  const afterTransition = () => setInTransition(false);

  return (
    <section
      className={classnames("Accordion", {
        "Accordion--open": open,
      })}
    >
      <section className={"Accordion__indicator"} onClick={togglePanel}>
        <section className="Accordion__indicator--content">
          <section className={"Accordion__indicator--contentItem Accordion__indicator--contentItem--block"}>
            <span className="Accordion__panel--title">{title}</span>
            <span className="Accordion__panel--subTitle">{subTitle}</span>
          </section>
          <section className="Accordion__indicator--contentItem Accordion__indicator--contentItem--center Accordion__indicator--contentItem--rotate">
            <Image src={downArrow} alt="downarrow" className="Accordion__indicator--icon" />
          </section>
        </section>
      </section>
      <section className="Accordion__panel" onTransitionEnd={afterTransition}>
        <span className="Accordion__panel--description">{(inTransition || open) && description}</span>
      </section>
    </section>
  );
};

export default memo(Accordion);
