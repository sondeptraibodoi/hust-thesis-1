import argparse

from app.mnist_cnn import fine_tune_with_custom_data


def main():
    parser = argparse.ArgumentParser(
        description="Fine-tune digit CNN on uploaded real handwriting samples."
    )
    parser.add_argument("--epochs", type=int, default=2)
    parser.add_argument("--batch-size", type=int, default=64)
    parser.add_argument("--learning-rate", type=float, default=0.0001)
    args = parser.parse_args()

    result = fine_tune_with_custom_data(
        epochs=args.epochs,
        batch_size=args.batch_size,
        learning_rate=args.learning_rate,
    )

    print(result)


if __name__ == "__main__":
    main()
