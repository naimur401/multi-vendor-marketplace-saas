'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

interface FilterSidebarProps {
  onFilterChange?: (filters: Record<string, any>) => void;
}

export function FilterSidebar({ onFilterChange }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [categories, setCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.getAll('category')
  );
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'relevance');

  useEffect(() => {
    // Fetch categories and price range
    const fetchFilters = async () => {
      try {
        const [catRes, priceRes] = await Promise.all([
          fetch('/api/search/categories'),
          fetch('/api/search/price-range'),
        ]);

        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData.categories || []);
        }

        if (priceRes.ok) {
          const priceData = await priceRes.json();
          setPriceRange([
            priceData.minPrice || 0,
            priceData.maxPrice || 1000,
          ]);
        }
      } catch (error) {
        console.error('Error fetching filters:', error);
      }
    };

    fetchFilters();
  }, []);

  const applyFilters = () => {
    const params = new URLSearchParams();

    if (searchParams.get('q')) {
      params.set('q', searchParams.get('q')!);
    }

    selectedCategories.forEach((cat) => {
      params.append('category', cat);
    });

    params.set('minPrice', Math.floor(priceRange[0]).toString());
    params.set('maxPrice', Math.floor(priceRange[1]).toString());
    params.set('sortBy', sortBy);

    router.push(`/marketplace?${params.toString()}`);
    onFilterChange?.({
      categories: selectedCategories,
      priceRange,
      sortBy,
    });
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSortBy('relevance');
    setPriceRange([0, 1000]);
    router.push('/marketplace');
  };

  return (
    <div className="w-64 space-y-6 p-4 border rounded-lg h-fit sticky top-4">
      {/* Sort */}
      <div>
        <h3 className="font-semibold mb-3">Sort By</h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="relevance">Relevance</option>
          <option value="newest">Newest</option>
          <option value="price_low">Price: Low to High</option>
          <option value="price_high">Price: High to Low</option>
          <option value="popular">Most Popular</option>
        </select>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-3">Price Range</h3>
        <div className="space-y-3">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            min={0}
            max={10000}
            step={10}
            className="w-full"
          />
          <div className="flex gap-2">
            <input
              type="number"
              value={Math.floor(priceRange[0])}
              onChange={(e) =>
                setPriceRange([Number(e.target.value), priceRange[1]])
              }
              className="w-full px-2 py-1 border rounded text-sm"
              placeholder="Min"
            />
            <input
              type="number"
              value={Math.floor(priceRange[1])}
              onChange={(e) =>
                setPriceRange([priceRange[0], Number(e.target.value)])
              }
              className="w-full px-2 py-1 border rounded text-sm"
              placeholder="Max"
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Categories</h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category} className="flex items-center">
                <Checkbox
                  id={category}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedCategories([...selectedCategories, category]);
                    } else {
                      setSelectedCategories(
                        selectedCategories.filter((c) => c !== category)
                      );
                    }
                  }}
                />
                <label htmlFor={category} className="ml-2 cursor-pointer">
                  {category}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Apply Filters */}
      <div className="space-y-2 pt-4 border-t">
        <Button onClick={applyFilters} className="w-full">
          Apply Filters
        </Button>
        <Button onClick={clearFilters} variant="outline" className="w-full">
          Clear All
        </Button>
      </div>
    </div>
  );
}
