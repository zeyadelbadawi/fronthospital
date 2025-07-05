"use client";
import React from "react";
import { Home, ChevronRight } from 'lucide-react';
import Link from "next/link";
import styles from "../styles/breadcrumb.module.css";

const Breadcrumb = ({ heading, title }) => {
  return (
    <div className={styles.breadcrumbContainer}>
      {/* Dynamic heading */}
      <h6 className={styles.heading}>{heading}</h6>
      
      <nav aria-label="Breadcrumb navigation">
        <ul className={styles.breadcrumbList}>
          <li className={styles.breadcrumbItem}>
            <Link
              href="/"
              className={styles.breadcrumbLink}
              aria-label="Go to homepage"
            >
              <Home className={styles.homeIcon} size={18} />
              <span>Home</span>
            </Link>
          </li>
          
          {/* Separator */}
          <li className={styles.separator} aria-hidden="true">
            <ChevronRight size={14} />
          </li>
          
          {/* Current page */}
          <li className={styles.breadcrumbItem}>
            <span className={styles.currentPage} aria-current="page">
              {title}
            </span>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Breadcrumb;
