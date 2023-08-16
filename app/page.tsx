'use client'
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect } from 'react';
import Cookie from 'js-cookie';
import Layout from './layout';
import Chart from 'chart.js/auto';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

const Home = () => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [invoicesPerPage] = useState(5); 
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState(null);


  const handleShowDeleteModal = (index) => {
    setDeletingIndex(index);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingIndex(null);
  };

  const handleConfirmDelete = () => {
    handleCloseDeleteModal();
    const updatedInvoices = invoices.filter((_, i) => i !== deletingIndex);
    setInvoices(updatedInvoices);
    Cookie.set('invoices', JSON.stringify(updatedInvoices));
  };

  useEffect(() => {
    const storedInvoices = Cookie.get('invoices');
    if (storedInvoices) {
      setInvoices(JSON.parse(storedInvoices));
    }
  }, []);
  useEffect(() => {
  

  
    const config = {
      type: 'line',
      data: {
        labels: invoices.reverse().map(invoice => invoice.date), 
        datasets: [
          {
            label: 'Price',
            data: invoices.map(invoice => invoice.price), 
            borderColor: 'blue', 
            fill: false 
          },
          
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Invoice Prices Over Time'
          }
        }
      }
    };

    const existingChart = Chart.getChart('priceChart');
  if (existingChart) {
    existingChart.destroy();
  }

 
  const ctx = document.getElementById('priceChart').getContext('2d');
  const chart = new Chart(ctx, config);
  }, [invoices]);
  

  const handleAddInvoice = (e) => {
    e.preventDefault(); 
  
    if (name.trim() !== '' && price.trim() !== '' && date.trim() !== '') {
      const newInvoice = { name, price, date };
      const newInvoices = [...invoices, newInvoice];
      setInvoices(newInvoices);
      Cookie.set('invoices', JSON.stringify(newInvoices));
      setName('');
      setPrice('');
      setDate('');
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
  };
    // Apply pagination and filtering
    const indexOfLastInvoice = currentPage * invoicesPerPage;
    const indexOfFirstInvoice = indexOfLastInvoice - invoicesPerPage;
    const filteredInvoices = invoices.filter((invoice) =>
      invoice.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const currentInvoices = filteredInvoices.slice(indexOfFirstInvoice, indexOfLastInvoice);

  const totalPrice = invoices.reduce((total, invoice) => total + parseFloat(invoice.price), 0);


  return (
    <Layout>
      <div className="container mt-5">
        <h1 className="mb-4">Invoice registration</h1>
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            required 
          />
          <input
            type="number"
            className="form-control mt-2"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Price"
            required 
          />
          <input
            type="date"
            className="form-control mt-2"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            placeholder="Date"
            required 
          />
          <button className="btn btn-primary mt-3" onClick={handleAddInvoice}>
            Add invoice
          </button>
        </div>
        <div>
          <canvas id="priceChart" width="400" height="200"></canvas>
        </div>
        <br></br>
        <div>
          <h2>Invoice list:</h2>
           {/* Search bar */}
         <input
          type="text"
          className="form-control mt-2"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search by name in the list"
        />
        <br></br>
          <ul className="list-group">
            {currentInvoices.reverse().map((invoice, index) => (
              <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>{invoice.name}</strong> - {invoice.price} € - {invoice.date}
                </div>
                <button
                  className="btn btn-danger"
                  onClick={() => handleShowDeleteModal(index)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
            {/* Pagination */}
        <nav aria-label="Page navigation">
          <ul className="pagination justify-content-center">
            {Array.from({ length: Math.ceil(filteredInvoices.length / invoicesPerPage) }).map((_, index) => (
              <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                <button className="page-link" onClick={() => handlePageChange(index + 1)}>
                  {index + 1}
                </button>
              </li>
            ))}
          </ul>
        </nav>
          <div className="mt-3">
            <strong>Total: {totalPrice.toFixed(2)} €</strong>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="mt-5 text-center">
          Created by <strong><a href='https://github.com/Inspector0x4' style={{ textDecoration: 'none', color: 'black' }}>Inspector0x4</a></strong> & <strong>Guillaume</strong>
        </footer>
      </div>
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
            <Modal.Header closeButton>
              <Modal.Title>Delete Confirmation</Modal.Title>
            </Modal.Header>
            <Modal.Body>Are you sure you want to delete this invoice?</Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseDeleteModal}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleConfirmDelete}>
                Delete
              </Button>
            </Modal.Footer>
          </Modal>
      <br></br>
    </Layout>
  );
}
export default Home;
