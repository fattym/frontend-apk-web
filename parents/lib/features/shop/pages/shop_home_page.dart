import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/shop_provider.dart';

class ShopHomePage extends StatefulWidget {
  const ShopHomePage({super.key});

  @override
  State<ShopHomePage> createState() => _ShopHomePageState();
}

class _ShopHomePageState extends State<ShopHomePage> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() async {
      final shop = context.read<ShopProvider>();
      await shop.fetchCategories();
      await shop.fetchProducts();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('School Shop'), backgroundColor: Theme.of(context).colorScheme.inversePrimary),
      body: Consumer<ShopProvider>(
        builder: (context, shop, child) {
          if (shop.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }
          if (shop.products.isEmpty) {
            return const Center(child: Text('No products available yet.'));
          }
          return GridView.builder(
            padding: const EdgeInsets.all(8),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              childAspectRatio: 0.75,
              crossAxisSpacing: 8,
              mainAxisSpacing: 8,
            ),
            itemCount: shop.products.length,
            itemBuilder: (context, index) {
              final product = shop.products[index];
              return ProductCard(product: product);
            },
          );
        },
      ),
    );
  }
}

class ProductCard extends StatelessWidget {
  final dynamic product;
  const ProductCard({super.key, required this.product});

  @override
  Widget build(BuildContext context) {
    return Card(
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Container(
              color: Colors.grey[200],
              child: product['image'] != null
                  ? Image.network(product['image'], fit: BoxFit.cover, width: double.infinity)
                  : const Center(child: Icon(Icons.image, size: 48, color: Colors.grey)),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(product['name'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold), maxLines: 1, overflow: TextOverflow.ellipsis),
                const SizedBox(height: 4),
                Text('KES ${product['effective_price'] ?? product['price']}', style: const TextStyle(color: Colors.green, fontWeight: FontWeight.w600)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
