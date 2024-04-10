import React, { useState, useEffect } from 'react';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import { Elements, CardElement, useElements } from '@stripe/react-stripe-js';
import { Streamlit, StreamlitComponentBase, withStreamlitConnection } from "streamlit-component-lib";
import Select from 'react-select';
import { countries } from 'countries-list';


// Define props para CheckoutForm para manejar la clave pública de Stripe
interface CheckoutFormProps {
  stripePublicKey: string;
  stripe: Stripe | null;
}
interface TCountries {
  [code: string]: { name: string; }; // Asume que cada país tiene al menos un nombre.
}
const countryOptions = Object.keys(countries).map((code) => ({
  value: code,
  label: (countries as TCountries)[code].name,
}));

// Componente CheckoutForm para manejar la entrada del formulario de pago
const CheckoutForm: React.FC<CheckoutFormProps> = ({ stripe,stripePublicKey }) => {
  const elements = useElements();
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [cardError, setCardError] = useState('');
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<{ value: string; label: string; } | null>(null);


   // Estilos para el CardElement, inputs y botn
   const cardElementStyle = {
    style: {
      base: {
        color: "#495057",
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: "antialiased",
        fontSize: "16px",
        "::placeholder": {
          color: "#adb5bd"
        },
        marginTop: "20px", 
        marginBottom: "20px", 
      },
      invalid: {
        color: "#dc3545",
        iconColor: "#dc3545"
      }
    },
    hidePostalCode: true
  };
  
  const formStyle = {
    padding: "30px", 
    margin: "20px auto", 
    maxWidth: "540px", 
    border: "1px solid #dee2e6", 
    borderRadius: "0.375rem", 
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)" 
  };
  

// Estilo para inputs
const inputStyle: React.CSSProperties = {
  padding: "10px 15px",
  fontSize: "16px",
  border: "1px solid #ddd",
  borderRadius: "4px",
  outlineColor: "#5469d4",
  width: "100%",
  boxSizing: "border-box" as "border-box", // Esto asegura que TypeScript entienda el valor como un tipo válido.
  marginTop: "20px", 

};



// Estilo para el botón de submit
const submitButtonStyle = {
  backgroundColor: "#007bff",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold",
  border: "none",
  transition: "background-color 0.2s, box-shadow 0.2s",
  padding: "12px 20px",
  fontSize: "1rem",
  borderRadius: "0.25rem",
  outlineColor: "#495057",
  width: "100%",
  marginTop: "20px", 
};

// Estilos para react-select
const customSelectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    padding: '10px 15px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxShadow: state.isFocused ? '0 0 0 1px #5469d4' : 0,
    "&:hover": {
      borderColor: state.isFocused ? '#5469d4' : '#ddd'
    }
  }),
  menu: (base: any) => ({
    ...base,
    fontSize: '16px',
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isSelected ? '#007bff' : state.isFocused ? '#e9ecef' : 'white',
    color: state.isSelected ? 'white' : 'black',
    "&:active": {
      backgroundColor: '#007bff',
      color: 'white',
    }
  }),
};

// Contenedor con margen para elementos individuales
const elementWrapperStyle = {
  marginTop: "20px", 
};

  // Maneja la presentación del formulario
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements) {
      //console.log("Stripe.js aún no ha cargado.");
      return;
    }

    if (!name || !lastName || !phone || !address) {
      setMessage("Todos los campos son obligatorios");
      return;
    }

    const cardElement = elements.getElement(CardElement);
    
    
    if (cardElement) {

      const {error, paymentMethod} = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: `${name} ${lastName}`,
          email: email, 
          phone: phone,
          address: { 
            line1: address, 
            city: city,
            country: selectedCountry ? selectedCountry.value : '',
            postal_code: postalCode, 
          }
        },
      });
  
      if (error) {
        if (error.message !== undefined) {
          setCardError(error.message);
        } else {
          setCardError("Ocurrió un error desconocido en procesar el pago.");
          Streamlit.setComponentValue({ paymentMethodID: null, message: "Error en recoger los datos: no se puede realizar la transaccion" });

        }
      } else {
        setCardError('');
        
        Streamlit.setComponentValue({ paymentMethodID: paymentMethod.id, message: "Pago en proceso: conectando con el setrvidor de pago" });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre" required style={inputStyle}/>
      <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Apellidos" required style={inputStyle}/>
      <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Teléfono" required style={inputStyle}/>
      <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Dirección" required style={inputStyle}/>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo electrónico" required style={inputStyle}/>
      <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ciudad" required style={inputStyle}/>
        <input type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="Código Postal" required style={inputStyle}/>
      <div style={elementWrapperStyle}>
        <Select
          options={countryOptions}
          value={selectedCountry}
          onChange={(selectedOption) => {
            if (selectedOption !== null) {
              setSelectedCountry(selectedOption);
              setCountry(selectedOption.value);
            } else {
              // Manejar el caso en que no haya selección (opcional)
              setSelectedCountry(null);
              setCountry("");
            }
          }}
          placeholder="Selecciona el pais"
          styles={customSelectStyles}
          required
        />
      </div>

      <div style={elementWrapperStyle}>
        <CardElement options={cardElementStyle} onChange={(event) => {
          if (event.error) {
            setCardError(event.error.message);
          } else {
            setCardError(''); // Limpiar errores si el usuario corrige el error en el CardElement
          }
        }} />
      </div>

      <button type="submit" disabled={!stripe} style={submitButtonStyle}>Pagar</button>
      <div>{message} 
      {cardError && 
      <div>{cardError}</div>}
      </div>
    </form>
  );
};

// Componente principal que integra el formulario en un componente de Streamlit
class MyStripeComponent extends StreamlitComponentBase<any, any> {

  state = {
    stripe: null,
  };
  componentDidMount() {
    const { stripe_public_key: stripePublicKey } = this.props.args;
    loadStripe(stripePublicKey).then(stripe => this.setState({ stripe }));
  }
  public render = (): React.ReactNode => {
    const { stripe } = this.state;
    // Recupera la clave pública de Stripe pasada desde Python a través de las props
    const stripePublicKey: string = this.props.args["stripe_public_key"];
    
    return (
      <Elements stripe={stripe}>
        <div> </div>
         {stripe && <CheckoutForm stripe={stripe} stripePublicKey={stripePublicKey} />}
         <br></br>
      </Elements>
    );
  }
}

// Envuelve MyStripeComponent con withStreamlitConnection para la integración con Streamlit
export default withStreamlitConnection(MyStripeComponent);
