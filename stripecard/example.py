import streamlit as st
from stripecard import my_component
import stripe


stripe.api_key="your_private_key" # stripe privte key (you have to secure that private key)

RETURN_URL = "http://localhost:8501/"
STRIPE_PUBLIC_KEY = "your_public_key" #stripe public key to sent to the frontend( client side)
Amout_tocharge=2000
currency="usd"

def crear_payment_intent(amount, currency, payment_method_id, customer_id=None, metadata=None):
    """
    Crea un PaymentIntent con Stripe.
    
    Parámetros:
    - amount: Cantidad a cobrar, en la moneda más pequeña unidad (por ej., centavos para USD).
    - currency: Moneda en la que se realizará el cargo (por ej., 'usd').
    - payment_method_id: El ID del método de pago a usar.
    - customer_id: (Opcional) El ID de un cliente de Stripe al que asociar el PaymentIntent.
    - metadata: (Opcional) Un diccionario de datos adicionales para asociar con el PaymentIntent.
    """
    try:
        intent = stripe.PaymentIntent.create(
            amount=amount,
            currency=currency,
            payment_method=payment_method_id,
            confirmation_method='manual',
            confirm=True,
            customer=customer_id if customer_id else None,
            metadata=metadata if metadata else {},
            return_url=RETURN_URL
        )
        return intent
    except stripe.error.CardError as e:
        err = e.user_message if e.user_message else 'Hubo un problema con tu tarjeta.'
        print(f"Error de Tarjeta: {err}")
    except stripe.error.RateLimitError:
        print("Demasiadas solicitudes enviadas a la API de Stripe en un corto período de tiempo.")
    except stripe.error.InvalidRequestError as e:
        err_body = e.json_body
        err = err_body.get('error', {})
        print(f"Error: {err.get('message')}")
        print("La solicitud fue incorrecta o tiene parámetros inválidos.")
    except stripe.error.AuthenticationError:
        print("Falló la autenticación con la API de Stripe. Verifica tus claves API.")
    except stripe.error.APIConnectionError:
        print("Comunicación con la API de Stripe fallida. Revisa tu conexión a Internet y la disponibilidad de Stripe.")
    except stripe.error.StripeError:
        print("Un error ocurrió al procesar el pago. Por favor, inténtalo de nuevo más tarde.")
    except Exception as e:
        print(f"Un error inesperado ocurrió: {str(e)}")

    # Devuelve None para indicar que no se pudo crear el PaymentIntent por un error
    return None



# Add some test code to play with the component while it's in development.
# During development, we can run this just as we would any other Streamlit
# app: `$ streamlit run my_component/example.py`

st.title("Test de Componente de Pago con Stripe")

    # Aquí puedes añadir más lógica para gestionar el estado del pago,
    # como mostrar un mensaje de éxito o error después del intento de pago.

# Invoca tu componente de Stripe aquí
resultado = my_component(stripe_public_key=STRIPE_PUBLIC_KEY)
#print(resultado)
if  resultado:
    paymentMethodID = resultado["paymentMethodID"]
    message_result = resultado["message"]
    if paymentMethodID:
        #st.success(f"Conexion procesada correctamente!")
        st.success(message_result)
       # Ejemplo de uso
        amount = Amout_tocharge # $20, expresado en centavos
        currency = currency
        payment_method_id = paymentMethodID
        customer_id = 'cus_example'

        payment_intent = crear_payment_intent(amount, currency, payment_method_id)
        if payment_intent:
            print("Pago realizado exitosamente:", payment_intent.id)
            st.success("Pago realizado exitosamente")
        else:
            print("No se pudo realizar el pago debido a un error.")
            st.error("No se pudo realizar el pago debido a un error")

    else:
        st.error("Error en el proceso de pago. Por favor, intenta de nuevo.")
        st.error(message_result)
else:
    st.markdown("Esperando los datos...")

