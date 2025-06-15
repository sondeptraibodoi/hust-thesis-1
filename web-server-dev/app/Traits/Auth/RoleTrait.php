<?php

namespace App\Traits\Auth;

use App\Constants\RoleCode;
use App\Models\Auth\Role;

trait RoleTrait
{
    public function getRolesAttribute($value)
    {
        return explode(",", $this->vai_tro);
    }
    public function isTeacher()
    {
        return $this->is_giao_vien;
    }
    public function isStudent()
    {
        return $this->is_sinh_vien;
    }
    public function isAdmin()
    {
        return $this->vai_tro === RoleCode::ADMIN;
    }
    public function allow($code)
    {
        if ($this->isAdmin()) {
            return true;
        }
        return in_array($code, $this->roles);
    }
    public function allowMultiple($codes, $needsAll = false)
    {
        if ($this->isAdmin()) {
            return true;
        }
        if ($needsAll) {
            foreach ($codes as $code) {
                if (!in_array($code, $this->roles)) {
                    return false;
                }
            }

            return true;
        }
        foreach ($codes as $code) {
            if (in_array($code, $this->roles)) {
                return true;
            }
        }

        return false;
    }
}
