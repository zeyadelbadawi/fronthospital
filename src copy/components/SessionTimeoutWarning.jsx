"use client"

import { useSession } from "@/contexts/SessionContext"
import styles from "./styles/session-timeout-warning.module.css"

export default function SessionTimeoutWarning() {
    const { showTimeoutWarning, extendSession, handleSessionTimeout, keepMeLoggedIn, setKeepMeLoggedIn } = useSession()

    if (!showTimeoutWarning) {
        return null
    }

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Session Timeout Warning</h2>
                </div>

                <div className={styles.content}>
                    <p className={styles.message}>
                        Your session will expire in 1 minute due to inactivity. Would you like to continue your session?
                    </p>

                    <div className={styles.checkboxContainer}>
                        <input
                            type="checkbox"
                            id="keepLoggedIn"
                            checked={keepMeLoggedIn}
                            onChange={(e) => setKeepMeLoggedIn(e.target.checked)}
                            className={styles.checkbox}
                        />
                        <label htmlFor="keepLoggedIn" className={styles.checkboxLabel}>
                            Keep me logged in
                        </label>
                    </div>
                </div>

                <div className={styles.footer}>
                    <button onClick={handleSessionTimeout} className={styles.logoutBtn}>
                        Log Out
                    </button>
                    <button onClick={extendSession} className={styles.continueBtn}>
                        Continue Session
                    </button>
                </div>
            </div>
        </div>
    )
}
