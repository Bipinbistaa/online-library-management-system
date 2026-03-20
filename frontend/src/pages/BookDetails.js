import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/common/Loading';

const BookDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [borrowing, setBorrowing] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [showBorrowForm, setShowBorrowForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, review_text: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  const getMinDueDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  };

  const getDefaultDueDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 14);
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    setDueDate(getDefaultDueDate());
    const fetchData = async () => {
      try {
        const [bookRes, reviewsRes] = await Promise.all([
          api.get(`/books/${id}`),
          api.get(`/reviews/${id}`)
        ]);
        setBook(bookRes.data);
        setReviews(reviewsRes.data || []);
      } catch (error) {
        toast.error('Failed to load book details');
        navigate('/books');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleBorrow = async () => {
    if (!user) { toast.info('Please login to borrow books'); navigate('/login'); return; }
    if (!dueDate) { toast.error('Please select a due date'); return; }
    setBorrowing(true);
    try {
      await api.post('/borrows', { bookId: parseInt(id), due_date: dueDate });
      toast.success('Book borrowed successfully!');
      setBook(prev => ({ ...prev, available_copies: prev.available_copies - 1 }));
      setShowBorrowForm(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to borrow book');
    } finally {
      setBorrowing(false);
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.info('Please login to submit a review'); navigate('/login'); return; }
    setSubmittingReview(true);
    try {
      const response = await api.post('/reviews', { bookId: parseInt(id), ...reviewForm });
      setReviews(prev => [response.data.review, ...prev]);
      setReviewForm({ rating: 5, review_text: '' });
      toast.success('Review submitted!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div className="container"><Loading /></div>;
  if (!book) return null;

  return (
    <div className="container" style={{ paddingTop: '20px' }}>
      <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginBottom: '20px' }}>← Back</button>

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '30px' }}>
        {/* Book Cover */}
        <div>
          <div style={{
            width: '100%',
            height: '320px',
            background: `hsl(${book.bookId * 47 % 360}, 60%, 50%)`,
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '64px',
            marginBottom: '16px'
          }}>📖</div>

          {book.available_copies > 0 ? (
            showBorrowForm ? (
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Due Date</label>
                <input type="date" value={dueDate} min={getMinDueDate()}
                  onChange={e => setDueDate(e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', marginBottom: '8px' }}
                />
                <button className="btn btn-success" onClick={handleBorrow} disabled={borrowing}
                  style={{ width: '100%', padding: '10px', marginBottom: '8px' }}>
                  {borrowing ? 'Borrowing...' : 'Confirm Borrow'}
                </button>
                <button className="btn btn-secondary" onClick={() => setShowBorrowForm(false)} style={{ width: '100%', padding: '10px' }}>
                  Cancel
                </button>
              </div>
            ) : (
              <button className="btn btn-primary" onClick={() => setShowBorrowForm(true)} style={{ width: '100%', padding: '12px' }}>
                📚 Borrow This Book
              </button>
            )
          ) : (
            <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '6px', textAlign: 'center' }}>
              Currently Unavailable
            </div>
          )}
        </div>

        {/* Book Details */}
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>{book.title}</h1>
          <p style={{ fontSize: '16px', color: '#2563eb', marginBottom: '4px' }}>by {book.author_name}</p>
          <p style={{ color: '#6b7280', marginBottom: '16px' }}>{book.category_name}</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px' }}>
            {[
              { label: 'ISBN', value: book.isbn },
              { label: 'Publisher', value: book.publisher || 'N/A' },
              { label: 'Year', value: book.publication_year || 'N/A' },
              { label: 'Available', value: `${book.available_copies} / ${book.total_copies}` },
              { label: 'Rating', value: `${Number(book.avg_rating).toFixed(1)} ⭐ (${book.review_count} reviews)` }
            ].map(item => (
              <div key={item.label} className="card" style={{ padding: '12px' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>{item.label}</div>
                <div style={{ fontWeight: '600' }}>{item.value}</div>
              </div>
            ))}
          </div>

          {book.description && (
            <div className="card">
              <h3 style={{ fontWeight: '600', marginBottom: '8px' }}>Description</h3>
              <p style={{ color: '#374151', lineHeight: 1.6 }}>{book.description}</p>
            </div>
          )}

          {book.author_bio && (
            <div className="card">
              <h3 style={{ fontWeight: '600', marginBottom: '8px' }}>About the Author</h3>
              <p style={{ color: '#374151', lineHeight: 1.6 }}>{book.author_bio}</p>
              {book.author_country && <p style={{ color: '#6b7280', fontSize: '13px', marginTop: '4px' }}>From: {book.author_country}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div style={{ marginTop: '40px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '20px' }}>Reviews ({reviews.length})</h2>

        {user && (
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontWeight: '600', marginBottom: '16px' }}>Write a Review</h3>
            <form onSubmit={handleReview}>
              <div className="form-group">
                <label>Rating</label>
                <select value={reviewForm.rating} onChange={e => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })}
                  style={{ width: '120px', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}>
                  {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{'★'.repeat(r)} ({r})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Review</label>
                <textarea value={reviewForm.review_text} onChange={e => setReviewForm({ ...reviewForm, review_text: e.target.value })}
                  placeholder="Share your thoughts about this book..." rows={3} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={submittingReview}>
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        )}

        {reviews.length === 0 ? (
          <p style={{ color: '#6b7280', textAlign: 'center', padding: '30px' }}>No reviews yet. Be the first to review!</p>
        ) : reviews.map(review => (
          <div key={review.reviewId} className="card" style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div>
                <strong>{review.full_name || review.username}</strong>
                <span style={{ color: '#f59e0b', marginLeft: '8px' }}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
              </div>
              <span style={{ color: '#9ca3af', fontSize: '13px' }}>
                {new Date(review.review_date).toLocaleDateString()}
              </span>
            </div>
            {review.review_text && <p style={{ color: '#374151', lineHeight: 1.5 }}>{review.review_text}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookDetails;
