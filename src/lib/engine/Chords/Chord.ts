import { singleOct } from './MajorScale';

class Chord {
    constructor(degree,intervals,nextChordIdxs) {
        this.degree = degree;
        this.semitoneDist = singleOct[degree-1];
        this.intervals = intervals;
        this.nextChordIdxs = nextChordIdxs;
    }
    
    degree() {
    	return this.degree;
    }

    semitoneDist() {
        return this.semitoneDist;
    }

    intervals() {
        return this.intervals;
    }

    nextChordIdxs() {
        return this.nextChordIdxs;
    }

    nextChordIdx() {
        return this.nextChordIdxs[Math.floor(Math.random()*this.nextChordIdxs.length)];
    }

    generateVoicing(size) {
        if(size<3)
            return this.intervals.slice(0,3);
        // Take a contiguous slice from intervals for smoother voicing
        const upperIntervals = this.intervals.slice(1, Math.min(size, this.intervals.length));
        // Open voicing: raise every other note by an octave for warmth
        const voicing = upperIntervals.map((n, idx) => {
            if (idx % 2 === 1 && Math.random() < 0.5) {
                return n + 12;
            }
            return n;
        });
        // Sort ascending to avoid crossed voices
        voicing.sort((a, b) => a - b);
        voicing.unshift(0);
        return voicing;
    }

    generateMode() {
        return this.intervals.map(n => {
            if(n>=12)
                return n-12;
            else
                return n;
        });
    }
}

export default Chord;