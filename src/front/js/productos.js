export async function Productos(){
    try {
        const response = await fetch('/assets/productos.json');
        if(!response.ok){
            throw new Error(`Error HTTP: ${response.status}`,response.statusText);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}