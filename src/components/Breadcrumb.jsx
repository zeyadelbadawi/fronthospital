"use client";
import React from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";

const Breadcrumb = ({ heading, title }) => {
  return (
    <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-24">
      {/* ← dynamic H6 */}
      <h6 className="fw-semibold mb-0">{heading}</h6>

      <ul className="d-flex align-items-center gap-2">
        <li className="fw-medium">
          <Link
            href="/"
            className="d-flex align-items-center gap-1 hover-text-primary"
          >
            <Icon
              icon="solar:home-smile-angle-outline"
              className="icon text-lg"
            />
            {/* ← also shows your heading */}
          </Link>
        </li>
        {/* ← dynamic last crumb */}
        <li className="fw-medium">{title}</li>
 
      </ul>
    </div>
  );
};

export default Breadcrumb;
