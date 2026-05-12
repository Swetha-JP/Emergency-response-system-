class LocationService {

  // Get current position — tries high-accuracy GPS first, falls back to network
  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve(this._extract(position));
        },
        () => {
          // Fallback to network-based location
          navigator.geolocation.getCurrentPosition(
            (position) => resolve(this._extract(position)),
            (error) => {
              let message = 'Unable to get your location.';
              if (error.code === 1) message = 'Location permission denied. Please allow location access.';
              if (error.code === 2) message = 'Location unavailable. Check your GPS signal.';
              if (error.code === 3) message = 'Location request timed out. Try again.';
              reject(new Error(message));
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 30000 }
          );
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
      );
    });
  }

  // Watch position — streams continuous GPS updates to callback
  watchPosition(callback, errorCallback) {
    if (!navigator.geolocation) {
      errorCallback && errorCallback(new Error('Geolocation is not supported'));
      return null;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => callback(this._extract(position)),
      (error) => {
        console.warn('Watch position error:', error.message);
        errorCallback && errorCallback(error);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );

    return watchId;
  }

  // Best-of-N strategy: sample GPS repeatedly for `durationMs` milliseconds,
  // call `onUpdate` every time accuracy improves, resolve with the best result.
  // This is the most effective way to improve accuracy from browser JS.
  getBestPosition(onUpdate, durationMs = 15000) {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      let best = null;
      let watchId = null;
      let resolved = false;

      const finish = () => {
        if (resolved) return;
        resolved = true;
        if (watchId !== null) navigator.geolocation.clearWatch(watchId);
        if (best) resolve(best);
        else reject(new Error('Could not get location'));
      };

      // Stop after durationMs
      const timer = setTimeout(finish, durationMs);

      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const pos = this._extract(position);

          // Keep the most accurate reading seen so far
          if (!best || pos.accuracy < best.accuracy) {
            best = pos;
            onUpdate && onUpdate(best);

            // If we hit excellent accuracy (≤20m), stop early
            if (pos.accuracy <= 20) {
              clearTimeout(timer);
              finish();
            }
          }
        },
        (error) => {
          console.warn('getBestPosition error:', error.message);
          // Don't reject — keep trying until timeout
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
      );
    });
  }

  clearWatch(watchId) {
    if (watchId !== null && watchId !== undefined) {
      navigator.geolocation.clearWatch(watchId);
    }
  }

  _extract(position) {
    return {
      latitude:  position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy:  position.coords.accuracy,
      altitude:  position.coords.altitude,
      timestamp: position.timestamp
    };
  }
}

const locationService = new LocationService();
export default locationService;
