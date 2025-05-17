<?php

namespace App\Library\QueryBuilder\Sorts\Custom;

use App\Library\QueryBuilder\Sorts\Sort;

class FunctionSort implements Sort
{
    protected $sort;
    public function __construct($sort)
    {
        $this->sort = $sort;
    }
    public function __invoke($query, bool $descending, string $property)
    {
        $sort = $this->sort;
        $sort($query, $descending);
    }
}
