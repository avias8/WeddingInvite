"use client";

import { useState } from "react";

interface HotelInfoProps {
  name: string;
  address: string;
  description: string;
  image: string; // URL to the hotel image
  mapEmbedUrl: string; // Google Maps Embed URL
}

export default function HotelInfoPane({
  name,
  address,
  description,
  image,
  mapEmbedUrl,
}: HotelInfoProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const togglePane = () => setIsExpanded(!isExpanded);

  return (
    <div className="hotel-info-pane">
      {/* Collapsed View */}
      {!isExpanded ? (
        <div
          className="collapsed-pane"
          style={{ backgroundImage: `url(${image})` }}
          onClick={togglePane}
        >
          <h2>{name}</h2>
          <button className="expand-btn" aria-label="Expand">
            +
          </button>
        </div>
      ) : (
        // Expanded View
        <div className="expanded-pane">
          <div className="content">
            <div className="image-container">
              <img src={image} alt={name} />
            </div>
            <div className="details">
              <h2>{name}</h2>
              <p>{address}</p>
              <p>{description}</p>
            </div>
          </div>
          <div className="map-container">
            <iframe
              src={mapEmbedUrl}
              title={`${name} Location`}
              allowFullScreen
              loading="lazy"
            />
          </div>
          <button className="collapse-btn" onClick={togglePane} aria-label="Collapse">
            -
          </button>
        </div>
      )}
      <style jsx>{`
        .hotel-info-pane {
          width: 100%;
          border: 1px solid #ccc;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
        }
        .collapsed-pane {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background-size: cover;
          background-position: center;
          color: white;
          height: 150px;
        }
        .collapsed-pane h2 {
          margin: 0;
        }
        .expand-btn {
          background: rgba(0, 0, 0, 0.6);
          color: white;
          border: none;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          font-size: 18px;
          cursor: pointer;
        }
        .expanded-pane {
          padding: 16px;
          background: white;
        }
        .content {
          display: flex;
          gap: 16px;
        }
        .image-container img {
          width: 150px;
          height: 150px;
          object-fit: cover;
          border-radius: 8px;
        }
        .details h2 {
          margin-top: 0;
        }
        .map-container iframe {
          width: 100%;
          height: 200px;
          border: none;
          margin-top: 16px;
        }
        .collapse-btn {
          background: rgba(0, 0, 0, 0.6);
          color: white;
          border: none;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          font-size: 18px;
          cursor: pointer;
          display: block;
          margin: 16px auto 0;
        }
      `}</style>
    </div>
  );
}
