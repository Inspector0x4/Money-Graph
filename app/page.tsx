'use client'
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect, SetStateAction } from 'react';
import Cookie from 'js-cookie';
import Layout from './layout';
import Chart from 'chart.js/auto';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { ChartConfiguration } from 'chart.js';
import { Nav, Navbar } from 'react-bootstrap';
import jsPDF from 'jspdf';


const Home = () => {
  
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState('');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [invoicesPerPage] = useState(5); 
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [showNavCollapse, setShowNavCollapse] = useState(false);

  interface Invoice {
    name: string;
    price: string;
    date: Date;
  }
  

  const handleShowDeleteModal = (index: number | null) => {
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
      const parsedInvoices: Invoice[] = JSON.parse(storedInvoices).map((invoice: Invoice) => ({
        ...invoice,
        date: new Date(invoice.date), 
      }));
      setInvoices(parsedInvoices);
    }
  }, []);
  useEffect(() => {
    
    const sortedInvoices = [...invoices].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  
    const config: ChartConfiguration<'line', string[], string> = {
      type: 'line',
      data: {
        labels: sortedInvoices.map(invoice => invoice.date.toLocaleDateString('fr-FR')), 

        datasets: [
        {
        label: 'Price',
        data: sortedInvoices.map(invoice => invoice['price']), 
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

 
  const ctx = (document.getElementById('priceChart') as HTMLCanvasElement).getContext('2d');

  const priceChartElement = document.getElementById('priceChart') as HTMLCanvasElement;
  if (priceChartElement) {
    const ctx = priceChartElement.getContext('2d');
    if (ctx) {
      const chart = new Chart(ctx, config);
    } else {
      console.error('Canvas context is null.');
    }
  } else {
    console.error("Element with ID 'priceChart' not found.");
  }
  
  const currentInvoices = sortedInvoices.slice(indexOfFirstInvoice, indexOfLastInvoice);


  }, [invoices]);
  

  const handleAddInvoice = (e: { preventDefault: () => void }) => {
    e.preventDefault();
  
    if (name.trim() !== '' && price.trim() !== '' && date.trim() !== '') {
      const newInvoice = {
        name,
        price,
        date: new Date(date), // Convertir en objet Date
      };
      const newInvoices = [...invoices, newInvoice];
      setInvoices(newInvoices);
      Cookie.set('invoices', JSON.stringify(newInvoices));
      setName('');
      setPrice('');
      setDate('');
    }
  };

  const handlePageChange = (pageNumber: SetStateAction<number>) => {
    setCurrentPage(pageNumber);
  };
  const handleSearch = (e: { target: { value: any; }; }) => {
    const query = e.target.value;
    setSearchQuery(query);
    setCurrentPage(1); 
  };
    
    const indexOfLastInvoice = currentPage * invoicesPerPage;
    const indexOfFirstInvoice = indexOfLastInvoice - invoicesPerPage;
    const filteredInvoices = invoices.filter((invoice) =>
      invoice.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  
  
  const currentInvoices = filteredInvoices.slice(indexOfFirstInvoice, indexOfLastInvoice);
  const totalPrice = invoices.reduce((total, invoice) => total + parseFloat(invoice['price']), 0);
  const handleToggleNavCollapse = () => {
    setShowNavCollapse(!showNavCollapse);
  };



  const exportChartAsJPG = () => {
    const priceChartElement = document.getElementById('priceChart') as HTMLCanvasElement;
    if (priceChartElement) {
      const image = priceChartElement.toDataURL('image/jpeg');
      const a = document.createElement('a');
      a.href = image;
      a.download = 'chart.jpg';
      a.click();
    } else {
      console.error("Element with ID 'priceChart' not found.");
    }
  };
  
  const generatePDF = () => {
    const doc = new jsPDF();
  

    doc.setFontSize(20);
    doc.setTextColor(0, 0, 0); 
    doc.text('Liste des Factures', 105, 15, null, null, 'center');
  
    
    doc.setFontSize(12);
  
    doc.text('Name', 30, 35); 
    doc.text('Price', 110, 35);
    doc.text('Date', 160, 35); 

  
    
    const startY = 45; 
    const lineHeight = 12;
    doc.setFontSize(12);
  
    currentInvoices.forEach((invoice, index) => {
      const y = startY + index * lineHeight;
      doc.text(`${invoice.name}`, 30, y);
      doc.text(`${invoice.price} €`, 110, y);
      doc.text(`${invoice.date.toLocaleDateString('fr-FR')}`, 160, y);
    });
  
    // Footer
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Page ${i} de ${totalPages}`, 10, 290);
      doc.setTextColor(0, 0, 0);
      doc.text(`Generated by: ${window.location.href}`, 100, 290, null, null, 'center');
    }
  
    
    doc.save('liste_des_factures.pdf');
  };


  return (
    <Layout>
  <div className="container">
  <Navbar expand="lg" bg="light" className="ms-3">
  <Navbar.Brand href="#">🏠</Navbar.Brand>
  <Navbar.Toggle aria-controls="navbarSupportedContent" onClick={handleToggleNavCollapse} />
  <Navbar.Collapse id="navbarSupportedContent" className={showNavCollapse ? 'show' : ''}>
    <Nav className="ms-auto">
      <Nav.Link href="https://github.com/Inspector0x4/Money-Graph" target="_blank" rel="noopener noreferrer">Source</Nav.Link>
      <Nav.Link href="https://github.com/Inspector0x4/Money-Graph/issues" target="_blank" rel="noopener noreferrer">Bug?</Nav.Link>
    
    </Nav>
  </Navbar.Collapse>
</Navbar>
</div>

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
            min="2023-01-01"
            max="2023-12-31"
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
            {currentInvoices.map((invoice, index) => (
              <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                <strong>{invoice['name']}</strong> - {invoice['price']} € - {invoice.date.toLocaleDateString('fr-FR')}

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
        


        <div className="container mt-3">
      <canvas id="priceChart" width="400" height="200"></canvas>
      <button className="btn btn-primary mt-3" onClick={handleAddInvoice}>
        Add invoice
      </button>
      <br></br>
      <button className="btn btn-success mt-3" onClick={exportChartAsJPG}>
        Export Chart as JPG
      </button>
      <br></br>
      <button className="btn btn-primary mt-3" onClick={generatePDF}>
      Generate PDF of the list
    </button>
    </div>
                   


        {/* Footer */}
        <footer className="mt-5 text-center">
          Created by <strong><a href='https://github.com/Inspector0x4' style={{ textDecoration: 'none', color: 'black' }}>Inspector0x4</a></strong> & <strong><a href='https://github.com/ProjectMagic18' style={{ textDecoration: 'none', color: 'black' }}>ProjectMagic18</a></strong>
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
