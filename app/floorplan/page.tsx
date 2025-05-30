// app/floorplan/page.tsx  (NEW LOCATION)
import React from 'react';
import Link from 'next/link';
// *** ADJUSTED Import path for the visualization component ***
import FloorPlanVisualization from '../management/rsvp/FloorPlanVisualization';
// *** ADJUSTED Import path for the CSS module ***
import styles from './FloorPlanViewer.module.css';

export default function FloorPlanViewerPage() {
    return (
        // Basic container for the viewer page
        <div className={styles.viewerContainer}>
            <div className={styles.controls}>
                {/* *** ADJUSTED Back link path *** */}
                <Link href="/management/rsvp" className={styles.backButton}>
                    &larr; Back to RSVP Dashboard
                </Link>
                <p className={styles.instructions}>Pinch to zoom, drag to pan.</p>
            </div>
            {/* Wrapper to potentially control the size/scrolling */}
            <div className={styles.visualizationWrapper}>
                {/* MODIFICATION START: Pass fullView={true} */}
                <FloorPlanVisualization fullView={true} />
                {/* MODIFICATION END */}
            </div>
        </div>
    );
}