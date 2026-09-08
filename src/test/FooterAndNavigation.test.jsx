import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Footer from '../components/layout/Footer';

describe('Componente Footer y Navegación Legal (Frontend)', () => {

  it('Debe renderizar la cabecera local con el badge de Charbonnier', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    expect(screen.getAllByText(/(ComunaRed|CirculApp)/i)[0]).toBeInTheDocument();
    expect(screen.getByText('Charbonnier')).toBeInTheDocument();
    expect(screen.getByText(/Valle de Punilla · Córdoba/i)).toBeInTheDocument();
  });

  it('Debe renderizar las 5 columnas estructurales del footer', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    expect(screen.getByText('Comunidad')).toBeInTheDocument();
    expect(screen.getByText('Plataforma')).toBeInTheDocument();
    expect(screen.getByText('Educación')).toBeInTheDocument();
    expect(screen.getByText('Soporte')).toBeInTheDocument();
    expect(screen.getByText('Marco Legal')).toBeInTheDocument();
  });

  it('Debe contener enlaces correctos a /educational y /historial sin errores 404', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    const educationalLink = screen.getByRole('link', { name: /Guía de Separación en Origen/i });
    expect(educationalLink).toHaveAttribute('href', '/educational');

    const historyLink = screen.getByRole('link', { name: /Archivo Histórico/i });
    expect(historyLink).toHaveAttribute('href', '/historial');
  });

  it('Debe abrir el modal de Términos y Condiciones al hacer clic', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    const terminosBtn = screen.getByRole('button', { name: /^Términos y Condiciones$/i });
    fireEvent.click(terminosBtn);

    expect(screen.getByText(/Términos y Condiciones de Uso/i)).toBeInTheDocument();
    expect(screen.getByText(/Uso Comunitario/i)).toBeInTheDocument();
    expect(screen.getByText(/Propósito Comunitario/i)).toBeInTheDocument();

    // Cerrar modal
    const closeBtn = screen.getByRole('button', { name: /Entendido/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByText(/Propósito Comunitario/i)).toBeNull();
  });

  it('Debe abrir el modal de Exención de Responsabilidad Vecinal', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    const exencionBtn = screen.getByRole('button', { name: /^Exención de Responsabilidad$/i });
    fireEvent.click(exencionBtn);

    expect(screen.getByText(/Exención de Responsabilidad Vecinal/i)).toBeInTheDocument();
    expect(screen.getByText(/(ComunaRed|CirculApp) actúa exclusivamente como un canal digital/i)).toBeInTheDocument();
  });

});
