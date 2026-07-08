import React, { useEffect, useState } from 'react';

const GoogleCallback: React.FC = () => {
  const [status, setStatus] = useState('Completing sign-in...');

  useEffect(() => {
    // Google Implicit Grant returns tokens in the URL fragment / hash
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace('#', '?'));
    const accessToken = params.get('access_token');
    const error = params.get('error');

    if (error) {
      if (window.opener) {
        window.opener.postMessage({ type: 'GOOGLE_AUTH_FAILURE', error }, '*');
        window.close();
      }
      setStatus(`Authentication failed: ${error}`);
      return;
    }

    if (accessToken) {
      // Fetch user info from Google's userInfo API
      fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch Google profile info');
          return res.json();
        })
        .then((data) => {
          if (window.opener) {
            window.opener.postMessage(
              {
                type: 'GOOGLE_AUTH_SUCCESS',
                user: {
                  email: data.email,
                  name: data.name,
                  picture: data.picture,
                },
              },
              '*'
            );
            window.close();
          } else {
            setStatus('Successfully authenticated! You can close this window now.');
          }
        })
        .catch((err: any) => {
          console.error(err);
          if (window.opener) {
            window.opener.postMessage({ type: 'GOOGLE_AUTH_FAILURE', error: err.message }, '*');
            window.close();
          }
          setStatus('Failed to fetch profile. Please close this window and try again.');
        });
    } else {
      setStatus('No access token found.');
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 text-center">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <h2 className="text-lg font-bold text-slate-800">{status}</h2>
      <p className="text-xs text-slate-500 mt-2">Connecting securely with Google Accounts...</p>
    </div>
  );
};

export default GoogleCallback;
