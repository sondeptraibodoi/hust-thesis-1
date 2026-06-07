import argparse

from app.mnist_cnn import train_mnist_model


def main():
    parser = argparse.ArgumentParser(
        description="Train CNN model on MNIST + EMNIST Digits."
    )
    parser.add_argument("--epochs", type=int, default=3)
    parser.add_argument("--batch-size", type=int, default=128)
    args = parser.parse_args()

    result = train_mnist_model(
        epochs=args.epochs,
        batch_size=args.batch_size,
    )

    print(result)


if __name__ == "__main__":
    main()
