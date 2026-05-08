export const defaultJava = `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World! Welcome to Poolside!");
        
        // Example: Simple calculation
        int sum = 0;
        for (int i = 1; i <= 10; i++) {
            sum += i;
        }
        System.out.println("Sum of 1 to 10: " + sum);
        
        // Example: Array operations
        int[] numbers = {1, 2, 3, 4, 5};
        System.out.println("Array length: " + numbers.length);
    }
}`;