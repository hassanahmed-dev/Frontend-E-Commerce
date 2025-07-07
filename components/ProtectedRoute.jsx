"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { getProfile, setAuth } from '../store/slices/authSlice';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { loading, user } = useSelector(state => state.auth);
  const [isClient, setIsClient] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const userObj = localStorage.getItem('user');
    let userParsed = null;
    try {
      userParsed = userObj ? JSON.parse(userObj) : null;
    } catch (e) {
      userParsed = null;
    }
    if (!userParsed?.userId || !userParsed?.token) {
      router.push('/login');
    } else {
      // Only dispatch if Redux user is not set or different
      if (!user || user.userId !== userParsed.userId) {
      dispatch(setAuth(userParsed));
      dispatch(getProfile({ id: userParsed.userId, token: userParsed.token }));
      }
      setRole(userParsed.role);
      setIsClient(true);
    }
    // eslint-disable-next-line
  }, [router, dispatch]);

  if (!isClient || loading) return null;

  if (adminOnly && role !== 'admin') {
    return <div style={{ padding: 40, fontWeight: 600, fontSize: 22, color: 'red' }}>Only admin can access</div>;
  }

  return children;
};

export default ProtectedRoute;
