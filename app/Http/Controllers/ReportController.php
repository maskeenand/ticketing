<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Carbon\Carbon;

class ReportController extends Controller
{
    /**
     * Display unit report dashboard
     */
    public function unitReport(Request $request): InertiaResponse
    {
        $user = $request->user();
        
        // Get date range from request
        $startDate = $request->input('start_date') ? Carbon::parse($request->input('start_date')) : Carbon::now()->subMonths(1);
        $endDate = $request->input('end_date') ? Carbon::parse($request->input('end_date')) : Carbon::now();
        
        // Get all units/projects
        $units = Project::with([
            'tickets' => function ($query) use ($startDate, $endDate) {
                $query->whereBetween('created_at', [$startDate->startOfDay(), $endDate->endOfDay()])
                    ->withCount('comments');
            }
        ])->orderBy('name')->get();

        // Calculate statistics for each unit
        $unitStatistics = $units->map(function ($unit) {
            $tickets = $unit->tickets;
            
            return [
                'id' => $unit->id,
                'name' => $unit->name,
                'code' => $unit->code,
                'total_tickets' => $tickets->count(),
                'open' => $tickets->where('status', 'open')->count(),
                'in_progress' => $tickets->where('status', 'in_progress')->count(),
                'resolved' => $tickets->where('status', 'resolved')->count(),
                'closed' => $tickets->where('status', 'closed')->count(),
                'pending' => $tickets->where('status', 'pending')->count(),
                'average_resolution_time' => $this->calculateAverageResolutionTime($tickets),
            ];
        });

        // Get overall statistics
        $allTickets = Ticket::whereBetween('created_at', [$startDate->startOfDay(), $endDate->endOfDay()])->get();
        $overallStats = [
            'total_tickets' => $allTickets->count(),
            'open' => $allTickets->where('status', 'open')->count(),
            'in_progress' => $allTickets->where('status', 'in_progress')->count(),
            'resolved' => $allTickets->where('status', 'resolved')->count(),
            'closed' => $allTickets->where('status', 'closed')->count(),
            'pending' => $allTickets->where('status', 'pending')->count(),
        ];

        // Get top performing units (by resolution rate)
        $topUnits = $unitStatistics->sortByDesc(function ($unit) {
            return $unit['total_tickets'] > 0 
                ? ($unit['closed'] + $unit['resolved']) / $unit['total_tickets'] 
                : 0;
        })->take(5);

        return Inertia::render('Report/UnitReport', [
            'unitStatistics' => $unitStatistics,
            'overallStats' => $overallStats,
            'topUnits' => $topUnits,
            'startDate' => $startDate->format('Y-m-d'),
            'endDate' => $endDate->format('Y-m-d'),
        ]);
    }

    /**
     * Export unit report to Excel (.xlsx)
     */
    public function exportUnitReport(Request $request): Response
    {
        // Get date range from request
        $startDate = $request->input('start_date') ? Carbon::parse($request->input('start_date')) : Carbon::now()->subMonths(1);
        $endDate = $request->input('end_date') ? Carbon::parse($request->input('end_date')) : Carbon::now();
        
        // Get all units/projects
        $units = Project::with([
            'tickets' => function ($query) use ($startDate, $endDate) {
                $query->whereBetween('created_at', [$startDate->startOfDay(), $endDate->endOfDay()]);
            }
        ])->orderBy('name')->get();

        // Calculate statistics for each unit
        $unitStatistics = $units->map(function ($unit) {
            $tickets = $unit->tickets;
            
            $resolutionRate = $tickets->count() > 0
                ? (int)(($tickets->where('status', 'closed')->count() + $tickets->where('status', 'resolved')->count()) / $tickets->count() * 100)
                : 0;
            
            return [
                'name' => $unit->name,
                'code' => $unit->code,
                'total_tickets' => $tickets->count(),
                'open' => $tickets->where('status', 'open')->count(),
                'in_progress' => $tickets->where('status', 'in_progress')->count(),
                'resolved' => $tickets->where('status', 'resolved')->count(),
                'closed' => $tickets->where('status', 'closed')->count(),
                'pending' => $tickets->where('status', 'pending')->count(),
                'average_resolution_time' => $this->calculateAverageResolutionTime($tickets),
                'resolution_rate' => $resolutionRate . '%',
            ];
        });

        // Get overall statistics
        $allTickets = Ticket::whereBetween('created_at', [$startDate->startOfDay(), $endDate->endOfDay()])->get();
        $overallStats = [
            'total_tickets' => $allTickets->count(),
            'open' => $allTickets->where('status', 'open')->count(),
            'in_progress' => $allTickets->where('status', 'in_progress')->count(),
            'resolved' => $allTickets->where('status', 'resolved')->count(),
            'closed' => $allTickets->where('status', 'closed')->count(),
            'pending' => $allTickets->where('status', 'pending')->count(),
        ];

        // Create Excel file using native PHP
        $excelContent = $this->generateExcelFile($startDate, $endDate, $overallStats, $unitStatistics);

        return response($excelContent, 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="Laporan-Unit-' . now()->format('Y-m-d-His') . '.xlsx"',
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
            'Pragma' => 'no-cache',
            'Expires' => '0',
        ]);
    }

    /**
     * Generate Excel file (.xlsx) manually
     */
    private function generateExcelFile($startDate, $endDate, $overallStats, $unitStatistics): string
    {
        // Create temporary directory for Excel files
        $tempDir = sys_get_temp_dir() . '/excel_' . uniqid();
        
        // Ensure directory doesn't exist and create it
        if (is_dir($tempDir)) {
            $this->deleteDirectory($tempDir);
        }
        mkdir($tempDir);

        // Create the .rels directory
        $relsDir = $tempDir . '/_rels';
        if (!is_dir($relsDir)) {
            mkdir($relsDir);
        }

        // Create the workbook.xml.rels file
        $rels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' . "\n";
        $rels .= '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' . "\n";
        $rels .= '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' . "\n";
        $rels .= '</Relationships>';
        file_put_contents($relsDir . '/.rels', $rels);

        // Create xl directory and its subdirectories
        $xlDir = $tempDir . '/xl';
        if (!is_dir($xlDir)) {
            mkdir($xlDir);
        }

        $xlRelsDir = $xlDir . '/_rels';
        if (!is_dir($xlRelsDir)) {
            mkdir($xlRelsDir);
        }

        // Create the workbook.xml.rels file
        $xlRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' . "\n";
        $xlRels .= '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' . "\n";
        $xlRels .= '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' . "\n";
        $xlRels .= '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' . "\n";
        $xlRels .= '</Relationships>';
        file_put_contents($xlRelsDir . '/workbook.xml.rels', $xlRels);

        // Create styles.xml
        $styles = $this->generateStyles();
        file_put_contents($xlDir . '/styles.xml', $styles);

        // Create worksheet
        $worksheet = $this->generateWorksheet($startDate, $endDate, $overallStats, $unitStatistics);
        $worksheetsDir = $xlDir . '/worksheets';
        if (!is_dir($worksheetsDir)) {
            mkdir($worksheetsDir);
        }
        file_put_contents($worksheetsDir . '/sheet1.xml', $worksheet);

        // Create workbook.xml
        $workbook = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' . "\n";
        $workbook .= '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' . "\n";
        $workbook .= '<sheets><sheet name="Report" sheetId="1" r:id="rId1" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/></sheets>' . "\n";
        $workbook .= '</workbook>';
        file_put_contents($xlDir . '/workbook.xml', $workbook);

        // Create [Content_Types].xml
        $contentTypes = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' . "\n";
        $contentTypes .= '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' . "\n";
        $contentTypes .= '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' . "\n";
        $contentTypes .= '<Default Extension="xml" ContentType="application/xml"/>' . "\n";
        $contentTypes .= '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' . "\n";
        $contentTypes .= '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' . "\n";
        $contentTypes .= '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' . "\n";
        $contentTypes .= '</Types>';
        file_put_contents($tempDir . '/[Content_Types].xml', $contentTypes);

        // Create ZIP file
        $zipFile = $tempDir . '/report.xlsx';
        $zip = new \ZipArchive();
        $zip->open($zipFile, \ZipArchive::CREATE | \ZipArchive::OVERWRITE);

        // Add files to ZIP
        $this->addFilesToZip($zip, $tempDir);
        $zip->close();

        // Read the Excel file
        $excelContent = file_get_contents($zipFile);

        // Clean up
        $this->deleteDirectory($tempDir);

        return $excelContent;
    }

    /**
     * Generate styles.xml for Excel
     */
    private function generateStyles(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' . "\n" .
            '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' . "\n" .
            '<fonts count="2"><font><sz val="11"/><color theme="1"/><name val="Calibri"/><family val="2"/></font>' .
            '<font><sz val="11"/><bold val="true"/><color theme="1"/><name val="Calibri"/><family val="2"/></font></fonts>' . "\n" .
            '<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>' . "\n" .
            '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>' . "\n" .
            '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' . "\n" .
            '<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>' .
            '<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="true"/></cellXfs>' . "\n" .
            '</styleSheet>';
    }

    /**
     * Generate worksheet XML
     */
    private function generateWorksheet($startDate, $endDate, $overallStats, $unitStatistics): string
    {
        $xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' . "\n";
        $xml .= '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' . "\n";
        $xml .= '<sheetData>' . "\n";

        $row = 1;

        // Title
        $xml .= '<row r="' . $row . '"><c r="A' . $row . '" t="str" s="1"><v>LAPORAN UNIT HELPDESK</v></c></row>' . "\n";
        $row++;

        // Period
        $xml .= '<row r="' . $row . '"><c r="A' . $row . '" t="str"><v>Periode: ' . $startDate->format('d/m/Y') . ' - ' . $endDate->format('d/m/Y') . '</v></c></row>' . "\n";
        $row++;

        // Generated date
        $xml .= '<row r="' . $row . '"><c r="A' . $row . '" t="str"><v>Generated: ' . now()->format('d/m/Y H:i:s') . '</v></c></row>' . "\n";
        $row++;
        $row++; // Empty row

        // Overall Statistics Header
        $xml .= '<row r="' . $row . '"><c r="A' . $row . '" t="str" s="1"><v>STATISTIK KESELURUHAN</v></c></row>' . "\n";
        $row++;

        // Overall Stats Data
        $stats = [
            'Total Tiket' => $overallStats['total_tickets'],
            'Buka' => $overallStats['open'],
            'Proses' => $overallStats['in_progress'],
            'Terselesaikan' => $overallStats['resolved'],
            'Ditutup' => $overallStats['closed'],
            'Pending' => $overallStats['pending'],
        ];

        foreach ($stats as $label => $value) {
            $xml .= '<row r="' . $row . '">';
            $xml .= '<c r="A' . $row . '" t="str"><v>' . $label . '</v></c>';
            $xml .= '<c r="B' . $row . '"><v>' . $value . '</v></c>';
            $xml .= '</row>' . "\n";
            $row++;
        }

        $row++; // Empty row

        // Unit Statistics Header
        $xml .= '<row r="' . $row . '"><c r="A' . $row . '" t="str" s="1"><v>STATISTIK PER UNIT</v></c></row>' . "\n";
        $row++;

        // Table Header
        $headers = ['Unit', 'Kode', 'Total', 'Buka', 'Proses', 'Terselesaikan', 'Ditutup', 'Pending', 'Rata-rata Waktu (jam)', 'Tingkat Resolusi'];
        $cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
        
        $xml .= '<row r="' . $row . '">';
        foreach ($headers as $idx => $header) {
            $xml .= '<c r="' . $cols[$idx] . $row . '" t="str" s="1"><v>' . $header . '</v></c>';
        }
        $xml .= '</row>' . "\n";
        $row++;

        // Unit Data
        foreach ($unitStatistics as $unit) {
            $xml .= '<row r="' . $row . '">';
            $xml .= '<c r="A' . $row . '" t="str"><v>' . htmlspecialchars($unit['name']) . '</v></c>';
            $xml .= '<c r="B' . $row . '" t="str"><v>' . $unit['code'] . '</v></c>';
            $xml .= '<c r="C' . $row . '"><v>' . $unit['total_tickets'] . '</v></c>';
            $xml .= '<c r="D' . $row . '"><v>' . $unit['open'] . '</v></c>';
            $xml .= '<c r="E' . $row . '"><v>' . $unit['in_progress'] . '</v></c>';
            $xml .= '<c r="F' . $row . '"><v>' . $unit['resolved'] . '</v></c>';
            $xml .= '<c r="G' . $row . '"><v>' . $unit['closed'] . '</v></c>';
            $xml .= '<c r="H' . $row . '"><v>' . $unit['pending'] . '</v></c>';
            $xml .= '<c r="I' . $row . '"><v>' . $unit['average_resolution_time'] . '</v></c>';
            $xml .= '<c r="J' . $row . '" t="str"><v>' . $unit['resolution_rate'] . '</v></c>';
            $xml .= '</row>' . "\n";
            $row++;
        }

        $xml .= '</sheetData>' . "\n";
        $xml .= '</worksheet>';

        return $xml;
    }

    /**
     * Add files to ZIP recursively
     */
    private function addFilesToZip(\ZipArchive $zip, string $directory, string $prefix = ''): void
    {
        $items = scandir($directory);

        foreach ($items as $item) {
            if ($item === '.' || $item === '..') {
                continue;
            }

            $path = $directory . '/' . $item;
            $zipPath = $prefix . $item;

            if (is_dir($path)) {
                $this->addFilesToZip($zip, $path, $zipPath . '/');
            } else {
                $zip->addFile($path, $zipPath);
            }
        }
    }

    /**
     * Delete directory recursively
     */
    private function deleteDirectory(string $directory): void
    {
        if (is_dir($directory)) {
            $items = scandir($directory);
            foreach ($items as $item) {
                if ($item === '.' || $item === '..') {
                    continue;
                }
                $path = $directory . '/' . $item;
                if (is_dir($path)) {
                    $this->deleteDirectory($path);
                } else {
                    unlink($path);
                }
            }
            rmdir($directory);
        }
    }

    /**
     * Display assignee report dashboard
     */
    public function assigneeReport(Request $request): InertiaResponse
    {
        $user = $request->user();

        $startDate = $request->input('start_date')
            ? Carbon::parse($request->input('start_date'))
            : Carbon::now()->subMonths(1);
        $endDate = $request->input('end_date')
            ? Carbon::parse($request->input('end_date'))
            : Carbon::now();

        // Tentukan tim user yang sedang login
        $userTeam = null;
        if ($user) {
            if ($user->role === 'it' || $user->team === 'IT') {
                $userTeam = 'IT';
            } elseif ($user->role === 'ipsrs' || $user->team === 'IPSRS') {
                $userTeam = 'IPSRS';
            }
        }

        // Jika bukan admin/supervisor, paksa filter sesuai tim sendiri
        $isAdmin = $user && in_array($user->role, ['admin', 'supervisor']);
        $categoryFilter = $isAdmin
            ? ($request->input('category') ?: null)
            : $userTeam;

        // Get all assignees who have tickets in the period
        $assigneesQuery = User::query()
            ->whereHas('assignedTickets', function ($q) use ($startDate, $endDate, $categoryFilter) {
                $q->whereBetween('created_at', [$startDate->copy()->startOfDay(), $endDate->copy()->endOfDay()]);
                if ($categoryFilter) {
                    $q->where('category', $categoryFilter);
                }
            })
            ->with(['assignedTickets' => function ($q) use ($startDate, $endDate, $categoryFilter) {
                $q->whereBetween('created_at', [$startDate->copy()->startOfDay(), $endDate->copy()->endOfDay()]);
                if ($categoryFilter) {
                    $q->where('category', $categoryFilter);
                }
            }])
            ->orderBy('name');

        $assignees = $assigneesQuery->get();

        $assigneeStatistics = $assignees->map(function ($assignee) {
            $tickets = $assignee->assignedTickets;
            $total = $tickets->count();
            $resolved = $tickets->whereIn('status', ['resolved', 'closed'])->count();

            return [
                'id'                      => $assignee->id,
                'name'                    => $assignee->name,
                'employee_id'             => $assignee->employee_id,
                'team'                    => $assignee->team,
                'role'                    => $assignee->role,
                'total_assigned'          => $total,
                'open'                    => $tickets->where('status', 'open')->count(),
                'in_progress'             => $tickets->where('status', 'in_progress')->count(),
                'resolved'                => $tickets->where('status', 'resolved')->count(),
                'closed'                  => $tickets->where('status', 'closed')->count(),
                'pending'                 => $tickets->where('status', 'pending')->count(),
                'resolution_rate'         => $total > 0 ? round($resolved / $total * 100) : 0,
                'average_resolution_time' => $this->calculateAverageResolutionTime($tickets),
            ];
        })->sortByDesc('total_assigned')->values();

        // Overall stats for the period
        $allTicketsQuery = Ticket::whereBetween('created_at', [$startDate->copy()->startOfDay(), $endDate->copy()->endOfDay()]);
        if ($categoryFilter) {
            $allTicketsQuery->where('category', $categoryFilter);
        }
        $allTickets = $allTicketsQuery->get();

        $overallStats = [
            'total_tickets'    => $allTickets->count(),
            'assigned'         => $allTickets->whereNotNull('assignee_id')->count(),
            'unassigned'       => $allTickets->whereNull('assignee_id')->count(),
            'open'             => $allTickets->where('status', 'open')->count(),
            'in_progress'      => $allTickets->where('status', 'in_progress')->count(),
            'resolved'         => $allTickets->where('status', 'resolved')->count(),
            'closed'           => $allTickets->where('status', 'closed')->count(),
            'pending'          => $allTickets->where('status', 'pending')->count(),
        ];

        return Inertia::render('Report/AssigneeReport', [
            'assigneeStatistics' => $assigneeStatistics,
            'overallStats'       => $overallStats,
            'startDate'          => $startDate->format('Y-m-d'),
            'endDate'            => $endDate->format('Y-m-d'),
            'categoryFilter'     => $categoryFilter ?? '',
            'isAdmin'            => $isAdmin,
            'userTeam'           => $userTeam,
        ]);
    }

    /**
     * Export assignee report to Excel (.xlsx)
     */
    public function exportAssigneeReport(Request $request): Response
    {
        $user = $request->user();

        $startDate = $request->input('start_date')
            ? Carbon::parse($request->input('start_date'))
            : Carbon::now()->subMonths(1);
        $endDate = $request->input('end_date')
            ? Carbon::parse($request->input('end_date'))
            : Carbon::now();

        // Paksa filter tim jika bukan admin
        $userTeam = null;
        if ($user) {
            if ($user->role === 'it' || $user->team === 'IT') {
                $userTeam = 'IT';
            } elseif ($user->role === 'ipsrs' || $user->team === 'IPSRS') {
                $userTeam = 'IPSRS';
            }
        }
        $isAdmin = $user && in_array($user->role, ['admin', 'supervisor']);
        $categoryFilter = $isAdmin
            ? ($request->input('category') ?: null)
            : $userTeam;

        $assignees = User::query()
            ->whereHas('assignedTickets', function ($q) use ($startDate, $endDate, $categoryFilter) {
                $q->whereBetween('created_at', [$startDate->copy()->startOfDay(), $endDate->copy()->endOfDay()]);
                if ($categoryFilter) {
                    $q->where('category', $categoryFilter);
                }
            })
            ->with(['assignedTickets' => function ($q) use ($startDate, $endDate, $categoryFilter) {
                $q->whereBetween('created_at', [$startDate->copy()->startOfDay(), $endDate->copy()->endOfDay()]);
                if ($categoryFilter) {
                    $q->where('category', $categoryFilter);
                }
            }])
            ->orderBy('name')
            ->get();

        $assigneeStatistics = $assignees->map(function ($assignee) {
            $tickets = $assignee->assignedTickets;
            $total = $tickets->count();
            $resolved = $tickets->whereIn('status', ['resolved', 'closed'])->count();

            return [
                'name'                    => $assignee->name,
                'employee_id'             => $assignee->employee_id ?? '-',
                'team'                    => $assignee->team ?? '-',
                'total_assigned'          => $total,
                'open'                    => $tickets->where('status', 'open')->count(),
                'in_progress'             => $tickets->where('status', 'in_progress')->count(),
                'resolved'                => $tickets->where('status', 'resolved')->count(),
                'closed'                  => $tickets->where('status', 'closed')->count(),
                'pending'                 => $tickets->where('status', 'pending')->count(),
                'resolution_rate'         => ($total > 0 ? round($resolved / $total * 100) : 0) . '%',
                'average_resolution_time' => $this->calculateAverageResolutionTime($tickets),
            ];
        })->sortByDesc('total_assigned')->values();

        $allTicketsQuery = Ticket::whereBetween('created_at', [$startDate->copy()->startOfDay(), $endDate->copy()->endOfDay()]);
        if ($categoryFilter) {
            $allTicketsQuery->where('category', $categoryFilter);
        }
        $allTickets = $allTicketsQuery->get();

        $overallStats = [
            'total_tickets' => $allTickets->count(),
            'assigned'      => $allTickets->whereNotNull('assignee_id')->count(),
            'unassigned'    => $allTickets->whereNull('assignee_id')->count(),
            'open'          => $allTickets->where('status', 'open')->count(),
            'in_progress'   => $allTickets->where('status', 'in_progress')->count(),
            'resolved'      => $allTickets->where('status', 'resolved')->count(),
            'closed'        => $allTickets->where('status', 'closed')->count(),
            'pending'       => $allTickets->where('status', 'pending')->count(),
        ];

        $excelContent = $this->generateAssigneeExcelFile($startDate, $endDate, $categoryFilter, $overallStats, $assigneeStatistics);

        $suffix = $categoryFilter ? '-' . $categoryFilter : '';
        return response($excelContent, 200, [
            'Content-Type'        => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="Laporan-Petugas' . $suffix . '-' . now()->format('Y-m-d-His') . '.xlsx"',
            'Cache-Control'       => 'no-cache, no-store, must-revalidate',
            'Pragma'              => 'no-cache',
            'Expires'             => '0',
        ]);
    }

    /**
     * Generate Excel file for assignee report
     */
    private function generateAssigneeExcelFile($startDate, $endDate, $categoryFilter, $overallStats, $assigneeStatistics): string
    {
        $tempDir = sys_get_temp_dir() . '/excel_assignee_' . uniqid();
        if (is_dir($tempDir)) {
            $this->deleteDirectory($tempDir);
        }
        mkdir($tempDir);

        $relsDir = $tempDir . '/_rels';
        mkdir($relsDir);
        file_put_contents($relsDir . '/.rels',
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' . "\n" .
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' . "\n" .
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' . "\n" .
            '</Relationships>'
        );

        $xlDir = $tempDir . '/xl';
        mkdir($xlDir);
        $xlRelsDir = $xlDir . '/_rels';
        mkdir($xlRelsDir);
        file_put_contents($xlRelsDir . '/workbook.xml.rels',
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' . "\n" .
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' . "\n" .
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' . "\n" .
            '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' . "\n" .
            '</Relationships>'
        );

        file_put_contents($xlDir . '/styles.xml', $this->generateStyles());

        $worksheetsDir = $xlDir . '/worksheets';
        mkdir($worksheetsDir);
        file_put_contents($worksheetsDir . '/sheet1.xml',
            $this->generateAssigneeWorksheet($startDate, $endDate, $categoryFilter, $overallStats, $assigneeStatistics)
        );

        file_put_contents($xlDir . '/workbook.xml',
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' . "\n" .
            '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' . "\n" .
            '<sheets><sheet name="Laporan Petugas" sheetId="1" r:id="rId1" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/></sheets>' . "\n" .
            '</workbook>'
        );

        file_put_contents($tempDir . '/[Content_Types].xml',
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' . "\n" .
            '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' . "\n" .
            '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' . "\n" .
            '<Default Extension="xml" ContentType="application/xml"/>' . "\n" .
            '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' . "\n" .
            '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' . "\n" .
            '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' . "\n" .
            '</Types>'
        );

        $zipFile = $tempDir . '/report.xlsx';
        $zip = new \ZipArchive();
        $zip->open($zipFile, \ZipArchive::CREATE | \ZipArchive::OVERWRITE);
        $this->addFilesToZip($zip, $tempDir);
        $zip->close();

        $content = file_get_contents($zipFile);
        $this->deleteDirectory($tempDir);

        return $content;
    }

    /**
     * Generate worksheet XML for assignee report
     */
    private function generateAssigneeWorksheet($startDate, $endDate, $categoryFilter, $overallStats, $assigneeStatistics): string
    {
        $xml  = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' . "\n";
        $xml .= '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>' . "\n";

        $row = 1;
        $categoryLabel = $categoryFilter ? ' - ' . $categoryFilter : '';

        $xml .= '<row r="' . $row . '"><c r="A' . $row . '" t="str" s="1"><v>LAPORAN KINERJA PETUGAS' . htmlspecialchars($categoryLabel) . '</v></c></row>' . "\n";
        $row++;
        $xml .= '<row r="' . $row . '"><c r="A' . $row . '" t="str"><v>Periode: ' . $startDate->format('d/m/Y') . ' - ' . $endDate->format('d/m/Y') . '</v></c></row>' . "\n";
        $row++;
        $xml .= '<row r="' . $row . '"><c r="A' . $row . '" t="str"><v>Generated: ' . now()->format('d/m/Y H:i:s') . '</v></c></row>' . "\n";
        $row++;
        $row++; // empty

        // Overall stats
        $xml .= '<row r="' . $row . '"><c r="A' . $row . '" t="str" s="1"><v>STATISTIK KESELURUHAN</v></c></row>' . "\n";
        $row++;

        $statsLabels = [
            'Total Tiket' => $overallStats['total_tickets'],
            'Sudah Di-assign' => $overallStats['assigned'],
            'Belum Di-assign' => $overallStats['unassigned'],
            'Buka'           => $overallStats['open'],
            'Proses'         => $overallStats['in_progress'],
            'Terselesaikan'  => $overallStats['resolved'],
            'Ditutup'        => $overallStats['closed'],
            'Pending'        => $overallStats['pending'],
        ];
        foreach ($statsLabels as $label => $value) {
            $xml .= '<row r="' . $row . '"><c r="A' . $row . '" t="str"><v>' . $label . '</v></c><c r="B' . $row . '"><v>' . $value . '</v></c></row>' . "\n";
            $row++;
        }
        $row++; // empty

        // Table
        $xml .= '<row r="' . $row . '"><c r="A' . $row . '" t="str" s="1"><v>DETAIL PER PETUGAS</v></c></row>' . "\n";
        $row++;

        $headers = ['Nama Petugas', 'ID Pegawai', 'Tim', 'Total Assigned', 'Buka', 'Proses', 'Terselesaikan', 'Ditutup', 'Pending', 'Tingkat Resolusi', 'Rata-rata Waktu (jam)'];
        $cols    = ['A','B','C','D','E','F','G','H','I','J','K'];

        $xml .= '<row r="' . $row . '">';
        foreach ($headers as $i => $h) {
            $xml .= '<c r="' . $cols[$i] . $row . '" t="str" s="1"><v>' . $h . '</v></c>';
        }
        $xml .= '</row>' . "\n";
        $row++;

        foreach ($assigneeStatistics as $a) {
            $xml .= '<row r="' . $row . '">';
            $xml .= '<c r="A' . $row . '" t="str"><v>' . htmlspecialchars($a['name']) . '</v></c>';
            $xml .= '<c r="B' . $row . '" t="str"><v>' . htmlspecialchars((string)($a['employee_id'] ?? '-')) . '</v></c>';
            $xml .= '<c r="C' . $row . '" t="str"><v>' . htmlspecialchars((string)($a['team'] ?? '-')) . '</v></c>';
            $xml .= '<c r="D' . $row . '"><v>' . $a['total_assigned'] . '</v></c>';
            $xml .= '<c r="E' . $row . '"><v>' . $a['open'] . '</v></c>';
            $xml .= '<c r="F' . $row . '"><v>' . $a['in_progress'] . '</v></c>';
            $xml .= '<c r="G' . $row . '"><v>' . $a['resolved'] . '</v></c>';
            $xml .= '<c r="H' . $row . '"><v>' . $a['closed'] . '</v></c>';
            $xml .= '<c r="I' . $row . '"><v>' . $a['pending'] . '</v></c>';
            $xml .= '<c r="J' . $row . '" t="str"><v>' . $a['resolution_rate'] . '</v></c>';
            $xml .= '<c r="K' . $row . '"><v>' . $a['average_resolution_time'] . '</v></c>';
            $xml .= '</row>' . "\n";
            $row++;
        }

        $xml .= '</sheetData></worksheet>';
        return $xml;
    }

    /**
     * Calculate average resolution time in hours
     */
    private function calculateAverageResolutionTime($tickets)
    {
        $resolvedTickets = $tickets->whereNotNull('resolved_at');
        
        if ($resolvedTickets->isEmpty()) {
            return 0;
        }

        $totalHours = 0;
        foreach ($resolvedTickets as $ticket) {
            $createdAt = $ticket->created_at;
            $resolvedAt = $ticket->resolved_at;
            
            if ($createdAt && $resolvedAt) {
                $hours = $createdAt->diffInHours($resolvedAt);
                $totalHours += $hours;
            }
        }

        return round($totalHours / $resolvedTickets->count(), 2);
    }
}
