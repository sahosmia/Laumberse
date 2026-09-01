<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NotificationController extends Controller
{
    /**
     * Latest notifications for the current user, scoped via the Notifiable relation — a user
     * can only ever see/act on their own notifications, no separate authorization needed.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'notifications' => $user->notifications()
                ->latest()
                ->limit(20)
                ->get()
                ->map(fn ($n) => [
                    'id' => $n->id,
                    'type' => $n->data['notification_type'] ?? null,
                    'title' => $n->data['title'] ?? '',
                    'message' => $n->data['message'] ?? '',
                    'url' => $n->data['url'] ?? null,
                    'read_at' => $n->read_at,
                    'created_at' => $n->created_at,
                ]),
            'unread_count' => $user->unreadNotifications()->count(),
        ]);
    }

    public function markRead(Request $request, string $notification): JsonResponse
    {
        $request->user()->notifications()->where('id', $notification)->first()?->markAsRead();

        return response()->json(['status' => 'ok']);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->json(['status' => 'ok']);
    }
}
