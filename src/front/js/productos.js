export async function Productos() {
    try {
      const response = await fetch("http://localhost:3000/api/products");
  
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
  
      const data = await response.json();
  
      return {
        productos: data.products || []
      };
    } catch (error) {
      console.error("Error fetching productos desde API:", error);
      return { productos: [] };
    }
  }
  
  export async function ProductoPorId(id) {
    try {
      const response = await fetch(`http://localhost:3000/api/products/${id}`);
  
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
  
      const data = await response.json();
  
      return data.product;
    } catch (error) {
      console.error("Error fetching producto por id:", error);
      return null;
    }
  }