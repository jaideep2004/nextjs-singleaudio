import { Chart, ArcElement, BarElement, LineElement, CategoryScale, LinearScale, Tooltip, Legend, Title } from 'chart.js';

export function registerChartElements() {
  Chart.register(
    ArcElement,
    BarElement,
    LineElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    Title
  );
}
