import  Order  from '../models/Order.js';
import  License  from '../models/License.js';
import  Product  from '../models/Product.js';
import  User  from '../models/User.js';
import { Resend } from 'resend';

export const createOrder = async (req, res) => {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { userId, items, metodoPago, referenciaPago } = req.body;

    if (!userId || !items || items.length === 0 || !metodoPago) {
      return res.status(400).json({
        ok: false,
        message: "userId, items y metodoPago son obligatorios"
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado"
      });
    }

    let totalPrice = 0;
    const processedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return res.status(404).json({
          ok: false,
          message: `Producto ${item.productId} no encontrado`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          ok: false,
          message: `Stock insuficiente para ${product.nombre}`
        });
      }

      const subtotal = product.precio * item.quantity;
      totalPrice += subtotal;

      processedItems.push({
        nombre: product.nombre,
        cantidad: item.quantity,
        precioUnitario: product.precio,
        subtotal: subtotal,
        product: product._id
      });
    }

    const newOrder = new Order({
      user: userId,
      items: processedItems,
      total: totalPrice,
      metodoPago: metodoPago,
      referenciaPago: referenciaPago || null,
      estado: "pagado"
    });

    const savedOrder = await newOrder.save();

    const licensesGenerated = [];

    for (const item of processedItems) {
      const product = await Product.findById(item.product);
      
      if (product.tipo_licencia) {
        for (let i = 0; i < item.cantidad; i++) {
          const licenseKey = generateLicenseKey();
          
          const newLicense = new License({
            product: product._id,
            clave: licenseKey,
            estado: "disponible",
            order: savedOrder._id,
            user: userId
          });

          await newLicense.save();
          licensesGenerated.push({
            productName: product.nombre,
            licenseKey: licenseKey
          });
        }
      }

      await Product.findByIdAndUpdate(
        product._id,
        { stock: product.stock - item.cantidad },
        { new: true }
      );
    }

    if (licensesGenerated.length > 0) {
      await sendLicenseEmail(user.email, user.fullname, licensesGenerated, savedOrder._id);
    }

    const populatedOrder = await Order.findById(savedOrder._id)
      .populate('user', 'fullname email')
      .populate('items.product', 'nombre precio');

    res.status(201).json({
      ok: true,
      message: "Orden creada correctamente",
      order: populatedOrder,
      licenses: licensesGenerated
    });

  } catch (error) {
    console.error('Error en createOrder:', error.message);
    res.status(500).json({
      ok: false,
      message: "Error al crear orden",
      error: error.message
    });
  }
};

async function sendLicenseEmail(email, fullname, licenses, orderId) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const licenseList = licenses
      .map(lic => `<li><strong>${lic.productName}</strong><br/>Código: <code style="background: #f0f0f0; padding: 5px;">${lic.licenseKey}</code></li>`)
      .join('');

    const htmlContent = `
      <h2>¡Gracias por tu compra, ${fullname}!</h2>
      <p>Tu orden <strong>#${orderId}</strong> ha sido procesada correctamente.</p>
      
      <h3>Códigos de Activación:</h3>
      <ul>
        ${licenseList}
      </ul>
      
      <p>Guarda estos códigos en un lugar seguro.</p>
      <p>Saludos,<br/>El equipo de 4Bit</p>
    `;

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: 'ecarmiolf@ucenfotec.ac.cr',//(Cambiar a email en producción)
      subject: '🎉 Tus códigos de licencia - 4Bit',
      html: htmlContent
    });
  } catch (error) {
    console.error('Error al enviar email:', error);
  }
}

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'fullname email')
      .populate('items.product', 'nombre precio');

    res.json({
      ok: true,
      orders: orders
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener órdenes",
      error: error.message
    });
  }
};

export const getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        ok: false,
        message: "ID de usuario inválido"
      });
    }

    const orders = await Order.find({ user: userId })
      .populate('items.product', 'nombre precio');

    res.json({
      ok: true,
      orders: orders
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener órdenes del usuario",
      error: error.message
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        ok: false,
        message: "ID de orden inválido"
      });
    }

    const order = await Order.findById(id)
      .populate('user', 'fullname email')
      .populate('items.product', 'nombre precio');

    if (!order) {
      return res.status(404).json({
        ok: false,
        message: "Orden no encontrada"
      });
    }

    res.json({
      ok: true,
      order: order
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al obtener orden",
      error: error.message
    });
  }
};

function generateLicenseKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let key = '';
  for (let i = 0; i < 20; i++) {
    if (i > 0 && i % 5 === 0) key += '-';
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}