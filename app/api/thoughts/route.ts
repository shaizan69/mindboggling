import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/server";
import { Thought } from "@/types";
import { moderateContent, sanitizeText } from "@/lib/content-moderation";

// GET - Fetch all thoughts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mood = searchParams.get("mood");
    const tag = searchParams.get("tag");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "50");

    let query = supabase.from("thoughts").select("*").order("created_at", { ascending: false }).limit(limit);

    if (mood) {
      query = query.eq("mood", mood);
    }

    if (tag) {
      query = query.contains("tags", [tag]);
    }

    if (search) {
      query = query.ilike("text", `%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error("Error fetching thoughts:", error);
    return NextResponse.json(
      { error: "Failed to fetch thoughts" },
      { status: 500 }
    );
  }
}

// POST - Create a new thought
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { text, tags, mood, embedding } = body;

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Thought text is required" },
        { status: 400 }
      );
    }

    // Sanitize text
    text = sanitizeText(text);

    // Moderate content
    const moderation = moderateContent(text);
    if (!moderation.isSafe) {
      return NextResponse.json(
        { error: moderation.reason || "Content not allowed" },
        { status: 400 }
      );
    }

    // Validate length
    if (text.length > 500) {
      return NextResponse.json(
        { error: "Thought text is too long (max 500 characters)" },
        { status: 400 }
      );
    }

    const thoughtData: Partial<Thought> = {
      text: text.trim(),
      tags: tags || [],
      mood: mood || null,
      connections: [],
    };

    // If embedding is provided, include it
    if (embedding && Array.isArray(embedding)) {
      // Note: Supabase client doesn't directly support vector type
      // You'll need to use a raw SQL query or format it properly
      thoughtData.embedding = embedding as any;
    }

    const { data, error } = await supabase
      .from("thoughts")
      .insert([thoughtData])
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("Error creating thought:", error);
    return NextResponse.json(
      { error: "Failed to create thought" },
      { status: 500 }
    );
  }
}

