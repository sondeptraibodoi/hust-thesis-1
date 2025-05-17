<?php

namespace App\Library\QueryBuilder\Concerns;

use App\Helpers\AggridHelper;

trait AddAgGridToQuery
{
    protected $aggird_filter = [];
    protected $aggird_field = [];
    public function allowedAgGrid($aggird_filter = [], $aggird_sort = [], $aggird_field = [])
    {
        $this->is_use_aggird = true;
        $this->aggird_filter = array_merge(
            [
                "date" => function () {
                    AggridHelper::convertDateFilterType(...func_get_args());
                },
                "datetime" => function () {
                    AggridHelper::convertDateTimeFilterType(...func_get_args());
                },
                "relationship" => function ($filter, $query, $key, $where) {
                    $value = $filter["filter"] ?? null;
                    if (!empty($value)) {
                        $query->{$where . "Has"}($filter["relationship"], function ($query) use ($filter, $value) {
                            $relationship_field = $filter["relationship_field"] ?? "id";
                            if (!empty($filter["relationship_table"])) {
                                $relationship_field = $filter["relationship_table"] . "." . $relationship_field;
                            }
                            $query->where($relationship_field, $value);
                        });
                    }
                },
            ],
            $aggird_filter
        );
        $this->addFunctionToCallWhenGet(function () use ($aggird_sort, $aggird_field) {
            $params = $this->request->aggrid();
            $sortModel = $params["sortModel"];
            $filterModel = $params["filterModel"];
            if (isset($sortModel) && count($sortModel) > 0) {
                foreach ($sortModel as $sort) {
                    if (isset($aggird_sort[$sort["colId"]])) {
                        $aggird_sort[$sort["colId"]]($this, $sort);
                    } else {
                        $this->orderBy($sort["colId"], $sort["sort"]);
                    }
                }
            }
            if (!empty($filterModel)) {
                foreach ($filterModel as $key => $filter) {
                    $custom_field = $aggird_field[$key] ?? null;
                    if (isset($custom_field) && !is_string($custom_field)) {
                        $aggird_field[$key]($filter, $this);
                    } elseif (str_contains($key, ".")) {
                        [$relation, $field] = cutByLastComma($key);
                        $relation = snakeToCamel($relation);
                        $this->whereHas($relation, function ($q) use ($filter, $field) {
                            if (isset($filter["operator"])) {
                                $filter["operator"] = strtolower($filter["operator"]);
                                $q->where(function ($q) use ($filter, $field) {
                                    $condition1 = $filter["condition1"];
                                    $this->convertFilterType($condition1, $q, $field);
                                    $condition2 = $filter["condition2"];
                                    $this->convertFilterType(
                                        $condition2,
                                        $q,
                                        $field,
                                        $filter["operator"] == "and" ? "where" : "orWhere"
                                    );
                                });
                            } else {
                                $this->convertFilterType($filter, $q, $field);
                            }
                        });
                    } elseif (isset($filter["operator"])) {
                        if (is_string($custom_field)) {
                            $key = $custom_field;
                        }
                        $filter["operator"] = strtolower($filter["operator"]);
                        $this->where(function ($query) use ($filter, $key) {
                            $condition1 = $filter["condition1"];
                            $this->convertFilterType($condition1, $query, $key);
                            $condition2 = $filter["condition2"];
                            $this->convertFilterType(
                                $condition2,
                                $query,
                                $key,
                                $filter["operator"] == "and" ? "where" : "orWhere"
                            );
                        });
                    } else {
                        if (is_string($custom_field)) {
                            $key = $custom_field;
                        }
                        $this->convertFilterType($filter, $this, $key);
                    }
                }
            }
            return $this;
        });
        return $this;
    }
    public function convertFilterType($filter, $query, $key, $where = "where")
    {
        $handle = $this->aggird_filter[$filter["filterType"]] ?? null;
        if (empty($handle)) {
            AggridHelper::convertTextFilterType($filter, $query, $key, $where);
        } else {
            $handle($filter, $query, $key, $where);
        }
    }
}

function snakeToCamel($input)
{
    return lcfirst(str_replace(" ", "", ucwords(str_replace("_", " ", $input))));
}
function cutByLastComma($string)
{
    // Find the position of the last comma
    $lastCommaPos = strrpos($string, ".");

    // Check if there's a comma in the string
    if ($lastCommaPos === false) {
        // No comma found, return the original string and an empty string
        return [$string, ""];
    }

    // Extract the substring before the last comma
    $beforeLastComma = substr($string, 0, $lastCommaPos);

    // Extract the substring after the last comma
    $afterLastComma = substr($string, $lastCommaPos + 1);

    return [$beforeLastComma, $afterLastComma];
}
