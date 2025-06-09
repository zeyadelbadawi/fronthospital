import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import axios from '@/helper/axiosSetup';
import Button from 'react-bootstrap/Button';

const PaymentEditModal = ({ show, onHide, payment, onUpdate }) => {
  if (!payment) return null;

  // ✅ State for editable fields
  const [price, setPrice] = useState(payment.price);
  const [date, setDate] = useState(new Date(payment.date).toISOString().split('T')[0]);
  const [note, setNote] = useState(payment.note || '');

  const handleSave = async () => {
    try {
      const res = await axios.put(`/authentication/payments/${payment._id}`, {
        price,
        date,
        note,
      });

      onUpdate(res.data);  // ✅ send updated payment back
      onHide();
    } catch (err) {
      console.error('Failed to update payment:', err);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Payment</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-3">
          <label className="form-label">Amount (EGP)</label>
          <input
            type="number"
            className="form-control"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Date</label>
          <input
            type="date"
            className="form-control"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Note</label>
          <textarea
            className="form-control"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancel</Button>
        <Button variant="primary" onClick={handleSave}>Save Changes</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PaymentEditModal;
