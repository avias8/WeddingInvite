/* eslint-disable @next/next/no-img-element */
import React from 'react';
import styles from './Lobby.module.css';

interface LobbyProps {
  message: string;
  winnerImage?: string | null;
  theme?: string;
}

const Lobby: React.FC<LobbyProps> = ({ message, winnerImage, theme }) => {
  return (
    <div className={styles.lobbyContainer}>
      {winnerImage ? (
        <>
          {theme && (
            <p className={styles.themeDisplay}>
              For the theme: <strong>&quot;{theme}&quot;</strong>
            </p>
          )}
          <div className={styles.winnerImageContainer}>
            <div className={styles.winnerBanner}>🏆 Winner!</div>
            <img src={winnerImage} alt="Winning selfie" className={styles.winnerImage} />
          </div>
        </>
      ) : (
        <div className={styles.throbber}></div>
      )}
      <h2 className={styles.lobbyMessage}>{message}</h2>
      {!winnerImage && <p className={styles.subMessage}>Get your cameras ready!</p>}
    </div>
  );
};

export default Lobby;

