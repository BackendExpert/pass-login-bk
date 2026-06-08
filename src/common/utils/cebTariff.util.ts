export function calculateCebTariff(units: number): number {
    let cost = 0;

    if (units <= 30) {
        cost = units * 30;
    } else if (units <= 60) {
        cost = (30 * 30) + (units - 30) * 37;
    } else if (units <= 90) {
        cost = (30 * 30) + (30 * 37) + (units - 60) * 42;
    } else if (units <= 120) {
        cost = (30 * 30) + (30 * 37) + (30 * 42) + (units - 90) * 50;
    } else if (units <= 180) {
        cost =
            (30 * 30) +
            (30 * 37) +
            (30 * 42) +
            (30 * 50) +
            (units - 120) * 75;
    } else {
        cost =
            (30 * 30) +
            (30 * 37) +
            (30 * 42) +
            (30 * 50) +
            (60 * 75) +
            (units - 180) * 85;
    }

    return cost;
}