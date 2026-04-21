import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

export const createOrder = async (req, res) => {
  try {
    const { user, items, total, metodoPago, referenciaPago = null, estado = 'pagado' } = req.body;

    if (!user || !items || !items.length || !total || !metodoPago) {
      return res.status(400).json({
        ok: false,
        message: 'Faltan datos obligatorios para crear el pedido'
      });
    }

    const order = await Order.create({
      user,
      items,
      total,
      metodoPago,
      referenciaPago,
      estado
    });

    res.status(201).json({
      ok: true,
      message: 'Pedido creado correctamente',
      order
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: 'Error creando pedido',
      error: error.message
    });
  }
};

export const createOrderFromCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const { metodoPago, referenciaPago = null } = req.body;

    if (!metodoPago) {
      return res.status(400).json({
        ok: false,
        message: 'metodoPago es obligatorio'
      });
    }

    const cart = await Cart.findOne({ user: userId }).populate({
      path: 'items.product',
      populate: {
        path: 'categoria',
        select: 'nombre slug'
      }
    });

    if (!cart || !cart.items.length) {
      return res.status(400).json({
        ok: false,
        message: 'El carrito está vacío'
      });
    }

    const itemsPedido = cart.items.map((item) => ({
      product: item.product._id,
      nombre: item.product.nombre,
      cantidad: item.cantidad,
      precioUnitario: item.precioUnitario,
      subtotal: item.subtotal,
      licencias: []
    }));

    const order = await Order.create({
      user: userId,
      items: itemsPedido,
      total: cart.total,
      metodoPago,
      referenciaPago,
      estado: 'pagado'
    });

    cart.items = [];
    cart.total = 0;
    await cart.save();

    res.status(201).json({
      ok: true,
      message: 'Pedido creado correctamente',
      order
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: 'Error creando pedido desde carrito',
      error: error.message
    });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'fullname email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      ok: true,
      orders
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: 'Error obteniendo pedidos',
      error: error.message
    });
  }
};

export const getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ user: userId })
      .populate('items.product', 'nombre thumbnail imagen categoria precio precio_en_descuento')
      .sort({ createdAt: -1 });

    const formattedOrders = orders.map((order) => ({
      id: order._id,
      fecha: new Date(order.createdAt).toLocaleDateString('es-CR'),
      estado: order.estado,
      metodoPago: order.metodoPago,
      subtotal: order.total,
      total: order.total,
      items: order.items.map((item) => ({
        _id: item.product?._id || item.product,
        nombre: item.nombre,
        cantidad: item.cantidad,
        precio: item.precioUnitario,
        precio_en_descuento: null,
        subtotal: item.subtotal,
        categoria:
          typeof item.product?.categoria === 'object'
            ? item.product?.categoria?.nombre || ''
            : item.product?.categoria || '',
        thumbnail: item.product?.thumbnail || '/assets/producto-default.png',
        imagen: item.product?.imagen || '/assets/producto-default.png'
      }))
    }));

    res.status(200).json({
      ok: true,
      orders: formattedOrders
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: 'Error obteniendo pedidos del usuario',
      error: error.message
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('user', 'fullname email')
      .populate('items.product', 'nombre thumbnail imagen categoria precio precio_en_descuento');

    if (!order) {
      return res.status(404).json({
        ok: false,
        message: 'Pedido no encontrado'
      });
    }

    res.status(200).json({
      ok: true,
      order
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: 'Error obteniendo pedido',
      error: error.message
    });
  }
};