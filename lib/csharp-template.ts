export const defaultCSharp = `using System;

namespace PoolsideCodeEditor
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Hello, World! Welcome to Poolside!");
            
            // Example: Simple calculation
            int sum = 0;
            for (int i = 1; i <= 10; i++)
            {
                sum += i;
            }
            Console.WriteLine($"Sum of 1 to 10: {sum}");
            
            // Example: Array operations
            int[] numbers = { 1, 2, 3, 4, 5 };
            Console.WriteLine($"Array length: {numbers.Length}");
        }
    }
}`;